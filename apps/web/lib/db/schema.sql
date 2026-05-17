-- =============================================================================
-- Schéma local — SQLite (référence) / IndexedDB Dexie (impl)
-- Projet : Code Galsen
-- Fichier cible repo : apps/web/lib/db/schema.sql (référence) + lib/db/schema.ts (Dexie)
-- =============================================================================
-- Note : ce SQL sert de référence canonique. Côté client web, on utilise Dexie
-- (IndexedDB) avec mapping 1:1 via une migration TS.
-- =============================================================================

-- THEMES
CREATE TABLE IF NOT EXISTS themes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title_fr        TEXT NOT NULL,
    title_wo        TEXT,
    icon_name       TEXT,
    order_index     INTEGER NOT NULL DEFAULT 0
);

-- ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_id        INTEGER NOT NULL,
    title_fr        TEXT NOT NULL,
    title_wo        TEXT,
    order_index     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(theme_id) REFERENCES themes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_act_theme ON activities(theme_id, order_index);

-- COURSE SHEETS
CREATE TABLE IF NOT EXISTS course_sheets (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id                 INTEGER,
    title_fr                    TEXT NOT NULL,
    title_wo                    TEXT,
    content_markdown_fr         TEXT NOT NULL,
    content_markdown_wo         TEXT,
    image_path                  TEXT,
    audio_explication_path      TEXT,
    audio_duration_seconds      INTEGER,
    reading_time_minutes        INTEGER NOT NULL DEFAULT 2,
    order_index                 INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cs_activity ON course_sheets(activity_id, order_index);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    course_sheet_id     INTEGER,
    question_text_fr    TEXT NOT NULL,
    image_path          TEXT,
    audio_path_wo       TEXT,
    timer_seconds       INTEGER NOT NULL DEFAULT 20,
    difficulty          TEXT NOT NULL DEFAULT 'facile'
                        CHECK (difficulty IN ('facile','moyen','difficile')),
    explanation_fr      TEXT,                       -- markdown affiché après réponse
    explanation_wo      TEXT,
    review_needed       INTEGER NOT NULL DEFAULT 0, -- 0/1
    FOREIGN KEY(course_sheet_id) REFERENCES course_sheets(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_q_sheet ON questions(course_sheet_id);
CREATE INDEX IF NOT EXISTS idx_q_difficulty ON questions(difficulty);

-- OPTIONS
CREATE TABLE IF NOT EXISTS options (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL,
    option_letter   TEXT NOT NULL CHECK (option_letter IN ('A','B','C','D')),
    option_text     TEXT NOT NULL,
    is_correct      INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_opt_q ON options(question_id);

-- USER PROGRESS (par compte local — si multi-user device, scoping via app_meta.user_id)
CREATE TABLE IF NOT EXISTS user_progress (
    user_id             TEXT NOT NULL,             -- uuid user (récupéré JWT)
    item_id             INTEGER NOT NULL,
    item_type           TEXT NOT NULL CHECK (item_type IN ('course_sheet','question')),
    status              TEXT NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started','in_progress','completed')),
    times_failed        INTEGER NOT NULL DEFAULT 0,
    last_action_date    TEXT,
    PRIMARY KEY(user_id, item_id, item_type)
);

-- QUIZ ATTEMPTS (sync-able)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    client_uuid     TEXT NOT NULL UNIQUE,          -- uuid v4 généré côté client (dédup serveur)
    user_id         TEXT NOT NULL,
    mode            TEXT NOT NULL CHECK (mode IN ('training','exam_blank')),
    started_at      TEXT NOT NULL,
    finished_at     TEXT,
    score           INTEGER,
    total_questions INTEGER,
    faults          INTEGER,
    passed          INTEGER NOT NULL DEFAULT 0,
    synced          INTEGER NOT NULL DEFAULT 0     -- 0 = à pousser, 1 = sync OK
);
CREATE INDEX IF NOT EXISTS idx_attempt_sync ON quiz_attempts(synced) WHERE synced = 0;

-- QUIZ ANSWERS (détail réponses, optionnel sync)
CREATE TABLE IF NOT EXISTS quiz_answers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id      INTEGER NOT NULL,
    question_id     INTEGER NOT NULL,
    option_id       INTEGER,
    is_correct      INTEGER NOT NULL,
    time_spent_ms   INTEGER,
    FOREIGN KEY(attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
);

-- SRS QUEUE (carnet erreurs / répétition espacée — SuperMemo-2 simplifié)
CREATE TABLE IF NOT EXISTS srs_queue (
    user_id         TEXT NOT NULL,
    question_id     INTEGER NOT NULL,
    next_review_at  TEXT NOT NULL,                 -- ISO 8601
    interval_days   INTEGER NOT NULL DEFAULT 1,
    ease_factor     REAL NOT NULL DEFAULT 2.5,
    fail_count      INTEGER NOT NULL DEFAULT 0,
    last_reviewed_at TEXT,
    PRIMARY KEY(user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_queue(user_id, next_review_at);

-- APP META (clé/valeur : version dataset, pass_jwt, user_id courant, etc.)
CREATE TABLE IF NOT EXISTS app_meta (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clés app_meta réservées (documentaire) :
--   'dataset_version'     → '2026.05.001'
--   'last_sync_at'        → ISO 8601
--   'pass_jwt'            → JWT RS256 signé serveur (valeur du pass actif)
--   'current_user_id'     → uuid user connecté
--   'preferred_lang'      → 'fr' | 'wo'
--   'install_id'          → uuid stable du device (généré 1ère ouverture)
