-- =============================================================================
-- Migration 001 — Schéma initial Postgres (Supabase)
-- Projet : Code Galsen / Auto-école Sénégal/UEMOA
-- Fichier : supabase/migrations/20260517000001_init.sql (dans le repo final)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- recherche texte

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           TEXT NOT NULL UNIQUE,        -- format E.164 (+221XXXXXXXX)
    phone_country   TEXT NOT NULL DEFAULT 'SN',
    full_name       TEXT,
    preferred_lang  TEXT NOT NULL DEFAULT 'fr'   -- 'fr' | 'wo'
                    CHECK (preferred_lang IN ('fr', 'wo')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,                  -- soft delete RGPD
    CONSTRAINT phone_format CHECK (phone ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;

-- =============================================================================
-- OTP CODES
-- =============================================================================
CREATE TABLE otp_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           TEXT NOT NULL,
    code_hash       TEXT NOT NULL,                -- bcrypt
    expires_at      TIMESTAMPTZ NOT NULL,
    attempts        SMALLINT NOT NULL DEFAULT 0,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      INET,
    CONSTRAINT max_attempts CHECK (attempts <= 5)
);

CREATE INDEX idx_otp_phone_active
    ON otp_codes(phone)
    WHERE used = FALSE;

CREATE INDEX idx_otp_cleanup
    ON otp_codes(expires_at)
    WHERE used = FALSE;

-- =============================================================================
-- SESSIONS (anti-partage : 1 active par user max)
-- =============================================================================
CREATE TABLE sessions (
    jti             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fp       TEXT,                         -- empreinte légère navigateur
    user_agent      TEXT,
    ip_address      INET,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_active
    ON sessions(user_id)
    WHERE revoked_at IS NULL;

-- Trigger : à l'INSERT d'une session active, révoquer toutes les autres du même user
CREATE OR REPLACE FUNCTION revoke_previous_sessions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE user_id = NEW.user_id
      AND jti != NEW.jti
      AND revoked_at IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_session
    AFTER INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION revoke_previous_sessions();

-- =============================================================================
-- PAYMENT INTENTS (idempotence webhooks)
-- =============================================================================
CREATE TABLE payment_intents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    provider        TEXT NOT NULL                 -- 'paydunya' | 'senepay' | 'wave' | 'orange_money'
                    CHECK (provider IN ('paydunya','senepay','wave','orange_money')),
    provider_ref    TEXT NOT NULL,                -- référence côté provider
    amount_fcfa     INTEGER NOT NULL CHECK (amount_fcfa > 0),
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','success','failed','expired','refunded')),
    raw_webhook     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_ref)               -- idempotence stricte
);

CREATE INDEX idx_payments_user_status ON payment_intents(user_id, status);

-- =============================================================================
-- PASSES (droit d'accès 90j)
-- =============================================================================
CREATE TABLE passes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_intent_id   UUID REFERENCES payment_intents(id),
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','active','expired','refunded')),
    amount_fcfa         INTEGER NOT NULL,
    activated_at        TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    pass_jwt            TEXT,                     -- JWT signé RS256 stocké local côté client
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_passes_user_active
    ON passes(user_id)
    WHERE status = 'active';

-- =============================================================================
-- CONTENT VERSIONS (dataset offline versionné)
-- =============================================================================
CREATE TABLE content_versions (
    version         TEXT PRIMARY KEY,             -- ex: '2026.05.001'
    manifest_url    TEXT NOT NULL,                -- URL Supabase Storage du manifest.json
    bundle_size_kb  INTEGER,
    released_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    changelog       TEXT
);

-- 1 seule version courante à la fois
CREATE UNIQUE INDEX idx_content_one_current
    ON content_versions((is_current))
    WHERE is_current = TRUE;

-- =============================================================================
-- QUIZ ATTEMPTS (sync depuis client pour analytics + ExamScore)
-- =============================================================================
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id       TEXT NOT NULL,                -- id côté IndexedDB pour dédup
    mode            TEXT NOT NULL CHECK (mode IN ('training','exam_blank')),
    started_at      TIMESTAMPTZ NOT NULL,
    finished_at     TIMESTAMPTZ,
    score           INTEGER,
    total_questions INTEGER,
    faults          INTEGER,
    passed          BOOLEAN DEFAULT FALSE,
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, client_id)                    -- dédup multi-sync
);

CREATE INDEX idx_attempts_user_date ON quiz_attempts(user_id, started_at DESC);

-- =============================================================================
-- TRIGGERS updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payment_intents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts   ENABLE ROW LEVEL SECURITY;

-- Note : otp_codes, content_versions = accès via Edge Functions uniquement (service_role).
-- RLS policies seront ajoutées en migration 002 après définition du custom JWT claim user_id.

-- =============================================================================
-- CLEANUP JOB (cron Supabase : exécuter toutes les heures)
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otp()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Activer via Supabase Cron extension :
-- SELECT cron.schedule('cleanup-otp', '0 * * * *', 'SELECT cleanup_expired_otp()');
