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

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts   ENABLE ROW LEVEL SECURITY;

-- Note : content_versions = accès via Edge Functions uniquement (service_role).
