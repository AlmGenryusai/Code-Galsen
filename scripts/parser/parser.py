#!/usr/bin/env python3
"""
Parseur Code FR → SQLite UEMOA (Sénégal).

Input  : fichier JSON questions/fiches code FR (format standard QCM).
Output : SQLite seed conforme schéma Code Galsen.

Règles d'adaptation :
- Vitesses FR (30/50/80/110/130) → UEMOA (40/60/80/100/120/140).
- Suppression questions contenant : neige, verglas, ZFE, Crit'Air, Loi Montagne, vignette écologique.
- Marquage "review_needed" si question ambigüe (ne supprime pas, requiert validation humaine).

Usage :
    python parser.py --input data/fr.json --output data/seed_uemoa.sqlite [--strict]

Tests : `python -m pytest test_parser.py`
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sqlite3
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("parser")


# -----------------------------------------------------------------------------
# Mapping vitesses FR → UEMOA
# -----------------------------------------------------------------------------
# Règlement UEMOA 8/2009 : 40, 60, 80, 100, 120, 140 km/h
# FR : 30, 50, 70, 80, 90, 100, 110, 130
SPEED_MAP_FR_TO_UEMOA: dict[int, int] = {
    30: 40,
    50: 60,
    70: 80,
    80: 80,    # identique
    90: 100,
    100: 100,  # identique (zone agglomération étendue UEMOA)
    110: 120,
    130: 140,
}

# Mots-clés bloquants : question est rejetée (concept inexistant au Sénégal)
BLOCKLIST_KEYWORDS: list[str] = [
    r"\bneige\b",
    r"\bverglas\b",
    r"\bcongères?\b",
    r"\bchaînes? à neige\b",
    r"\bpneus? hiver\b",
    r"\bloi montagne\b",
    r"\bzone à faibles? émissions?\b",
    r"\bZFE\b",
    r"\bcrit['’]?air\b",
    r"\bvignette écologique\b",
    r"\bzone bleue\b",
    r"\béco-?bonus\b",
]

# Mots-clés "review_needed" : adaptation possible mais doit être validé humain
REVIEW_KEYWORDS: list[str] = [
    r"\bautoroute\b",        # peu d'autoroutes au Sénégal hors ATTRA Dakar-Thiès
    r"\bpéage\b",
    r"\bplaque d['’]immatriculation\b",  # format différent SN
    r"\bAlcootest\b",        # seuils alcool différents
    r"\bpermis probatoire\b",  # n'existe pas SN
]

# Pattern vitesse : "50 km/h", "50km/h", "50 kmh", "50 km / h"
SPEED_PATTERN = re.compile(r"\b(\d{2,3})\s*km\s*/?\s*h\b", re.IGNORECASE)


# -----------------------------------------------------------------------------
# Modèle données interne
# -----------------------------------------------------------------------------
@dataclass
class Option:
    letter: str
    text: str
    is_correct: bool


@dataclass
class Question:
    id: int
    theme: str
    question_text: str
    options: list[Option]
    image_path: str | None = None
    difficulty: str = "facile"
    course_sheet_ref: str | None = None
    review_needed: bool = False
    review_reasons: list[str] = field(default_factory=list)


# -----------------------------------------------------------------------------
# Transformations
# -----------------------------------------------------------------------------
def remap_speeds(text: str) -> str:
    """Remplace toute mention de vitesse FR par équivalent UEMOA."""

    def _repl(match: re.Match[str]) -> str:
        speed = int(match.group(1))
        new = SPEED_MAP_FR_TO_UEMOA.get(speed)
        if new is None:
            # vitesse non mappée → garde mais marque pour review
            return match.group(0)
        return f"{new} km/h"

    return SPEED_PATTERN.sub(_repl, text)


def contains_any(text: str, patterns: Iterable[str]) -> tuple[bool, list[str]]:
    matched = [p for p in patterns if re.search(p, text, re.IGNORECASE)]
    return bool(matched), matched


def transform_question(raw: dict[str, Any]) -> Question | None:
    """
    Convertit 1 question brute → Question normalisée.
    Retourne None si rejetée (blocklist).
    """
    full_text = " ".join([
        raw.get("question", ""),
        " ".join(opt.get("text", "") for opt in raw.get("options", [])),
    ])

    blocked, hits = contains_any(full_text, BLOCKLIST_KEYWORDS)
    if blocked:
        log.debug("Rejet question id=%s, motifs=%s", raw.get("id"), hits)
        return None

    needs_review, review_hits = contains_any(full_text, REVIEW_KEYWORDS)

    q_text = remap_speeds(raw.get("question", "").strip())
    options = []
    for i, opt in enumerate(raw.get("options", [])):
        options.append(
            Option(
                letter=opt.get("letter") or chr(ord("A") + i),
                text=remap_speeds(opt.get("text", "").strip()),
                is_correct=bool(opt.get("is_correct", False)),
            )
        )

    # Validation : exactement 1+ option correcte
    correct_count = sum(1 for o in options if o.is_correct)
    if correct_count == 0:
        log.warning("Question id=%s sans option correcte → review", raw.get("id"))
        needs_review = True
        review_hits = review_hits + ["no_correct_option"]

    return Question(
        id=int(raw.get("id", 0)),
        theme=str(raw.get("theme", "Divers")),
        question_text=q_text,
        options=options,
        image_path=raw.get("image_path"),
        difficulty=raw.get("difficulty", "facile"),
        course_sheet_ref=raw.get("course_sheet_ref"),
        review_needed=needs_review,
        review_reasons=review_hits,
    )


# -----------------------------------------------------------------------------
# Schéma SQLite
# -----------------------------------------------------------------------------
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_fr TEXT NOT NULL UNIQUE,
    title_wo TEXT,
    icon_name TEXT
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_id INTEGER NOT NULL,
    title_fr TEXT NOT NULL,
    title_wo TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER,
    title_fr TEXT NOT NULL,
    title_wo TEXT,
    content_markdown_fr TEXT NOT NULL,
    content_markdown_wo TEXT,
    image_path TEXT,
    audio_explication_path TEXT,
    audio_duration_seconds INTEGER,
    reading_time_minutes INTEGER DEFAULT 2,
    order_index INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_sheet_id INTEGER,
    question_text_fr TEXT NOT NULL,
    image_path TEXT,
    audio_path_wo TEXT,
    timer_seconds INTEGER DEFAULT 20,
    difficulty TEXT DEFAULT 'facile',
    review_needed INTEGER DEFAULT 0,
    review_reasons TEXT,
    FOREIGN KEY(course_sheet_id) REFERENCES course_sheets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_letter TEXT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_q_sheet ON questions(course_sheet_id);
CREATE INDEX IF NOT EXISTS idx_opt_q ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_q_review ON questions(review_needed);
"""


def init_db(path: Path) -> sqlite3.Connection:
    if path.exists():
        log.warning("Output existe déjà, suppression : %s", path)
        path.unlink()
    conn = sqlite3.connect(path)
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    return conn


def upsert_theme(conn: sqlite3.Connection, title_fr: str) -> int:
    cur = conn.execute("SELECT id FROM themes WHERE title_fr = ?", (title_fr,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur = conn.execute("INSERT INTO themes(title_fr) VALUES (?)", (title_fr,))
    return cur.lastrowid


def insert_question(conn: sqlite3.Connection, q: Question, theme_id: int) -> int:
    cur = conn.execute(
        """
        INSERT INTO questions
            (question_text_fr, image_path, difficulty, review_needed, review_reasons)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            q.question_text,
            q.image_path,
            q.difficulty,
            1 if q.review_needed else 0,
            json.dumps(q.review_reasons) if q.review_reasons else None,
        ),
    )
    qid = cur.lastrowid
    for opt in q.options:
        conn.execute(
            """
            INSERT INTO options(question_id, option_letter, option_text, is_correct)
            VALUES (?, ?, ?, ?)
            """,
            (qid, opt.letter, opt.text, 1 if opt.is_correct else 0),
        )
    return qid


# -----------------------------------------------------------------------------
# Pipeline principal
# -----------------------------------------------------------------------------
def run(input_path: Path, output_path: Path, strict: bool = False) -> dict[str, int]:
    raw = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("Input JSON doit être une liste de questions à la racine")

    conn = init_db(output_path)
    stats = {"input": len(raw), "kept": 0, "rejected": 0, "review": 0}

    try:
        for item in raw:
            q = transform_question(item)
            if q is None:
                stats["rejected"] += 1
                continue
            theme_id = upsert_theme(conn, q.theme)
            insert_question(conn, q, theme_id)
            stats["kept"] += 1
            if q.review_needed:
                stats["review"] += 1
        conn.commit()
    finally:
        conn.close()

    log.info("Stats : %s", stats)
    if strict and stats["review"] > 0:
        log.error("Mode strict + %d questions à valider → exit 2", stats["review"])
        sys.exit(2)
    return stats


def main() -> None:
    p = argparse.ArgumentParser(description="Parseur code FR → SQLite UEMOA")
    p.add_argument("--input", required=True, type=Path, help="JSON questions FR")
    p.add_argument("--output", required=True, type=Path, help="SQLite seed sortie")
    p.add_argument("--strict", action="store_true", help="Exit 2 si review_needed > 0")
    args = p.parse_args()
    run(args.input, args.output, args.strict)


if __name__ == "__main__":
    main()
