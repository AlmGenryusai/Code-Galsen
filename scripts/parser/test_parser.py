"""
Tests pytest pour parser.

Usage : renommer 03_parser.py → parser.py et 03_parser_test.py → test_parser.py
dans le repo final (Claude Code), puis : `pytest test_parser.py -v`
"""

from __future__ import annotations

import json
from pathlib import Path

import parser  # type: ignore  # le module sera renommé "parser.py" dans le repo


def test_remap_speeds_basic():
    assert parser.remap_speeds("Limite 50 km/h") == "Limite 60 km/h"
    assert parser.remap_speeds("Autoroute 130 km/h max") == "Autoroute 140 km/h max"
    assert parser.remap_speeds("30km/h zone scolaire") == "40 km/h zone scolaire"


def test_remap_speeds_no_match():
    assert parser.remap_speeds("Aucune vitesse.") == "Aucune vitesse."


def test_blocklist_neige():
    raw = {
        "id": 1, "theme": "x",
        "question": "Que faire sur la neige ?",
        "options": [{"letter": "A", "text": "Mettre les chaînes", "is_correct": True}],
    }
    assert parser.transform_question(raw) is None


def test_blocklist_zfe():
    raw = {
        "id": 2, "theme": "x",
        "question": "Vous entrez dans une ZFE",
        "options": [{"letter": "A", "text": "OK", "is_correct": True}],
    }
    assert parser.transform_question(raw) is None


def test_keep_with_speed_remap():
    raw = {
        "id": 3, "theme": "V",
        "question": "Vitesse max en agglomération ?",
        "options": [
            {"letter": "A", "text": "30 km/h", "is_correct": False},
            {"letter": "B", "text": "50 km/h", "is_correct": True},
            {"letter": "C", "text": "70 km/h", "is_correct": False},
        ],
    }
    q = parser.transform_question(raw)
    assert q is not None
    assert "60 km/h" in q.options[1].text
    assert q.options[1].is_correct
    assert not q.review_needed


def test_review_flag_autoroute():
    raw = {
        "id": 4, "theme": "V",
        "question": "Sur autoroute, vitesse max ?",
        "options": [{"letter": "A", "text": "130 km/h", "is_correct": True}],
    }
    q = parser.transform_question(raw)
    assert q is not None
    assert q.review_needed


def test_no_correct_option_flagged():
    raw = {
        "id": 5, "theme": "T", "question": "?",
        "options": [
            {"letter": "A", "text": "x", "is_correct": False},
            {"letter": "B", "text": "y", "is_correct": False},
        ],
    }
    q = parser.transform_question(raw)
    assert q is not None
    assert q.review_needed
    assert "no_correct_option" in q.review_reasons


def test_full_pipeline(tmp_path: Path):
    data = [
        {"id": 1, "theme": "V", "question": "Vitesse ville ?",
         "options": [{"letter": "A", "text": "50 km/h", "is_correct": True}]},
        {"id": 2, "theme": "C", "question": "Sur la neige ?",
         "options": [{"letter": "A", "text": "Chaînes", "is_correct": True}]},
    ]
    in_f = tmp_path / "in.json"
    in_f.write_text(json.dumps(data), encoding="utf-8")
    out_f = tmp_path / "out.sqlite"
    stats = parser.run(in_f, out_f, strict=False)
    assert stats == {"input": 2, "kept": 1, "rejected": 1, "review": 0}
    assert out_f.exists()
