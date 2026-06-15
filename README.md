# Code Galsen

PWA mobile-first, offline-first pour préparer l'examen théorique du permis de conduire au Sénégal et dans la zone UEMOA.

**Modèle:** Pass Réussite · 4 900 FCFA · 90 jours · Mobile Money (Wave / Orange Money)

---

## Fonctionnalités MVP (état actuel)

| Écran | État |
|---|---|
| Dashboard — parcours, progression, chips | ✅ |
| Quiz libre — 15 questions UEMOA, feedback immédiat | ✅ |
| Examen blanc — timer 20s/Q, compteur fautes, résultat pass/fail | ✅ |
| Carnet — dernier score, taux moyen, thèmes faibles | ✅ |
| Profil | Stub — à venir |
| Auth OTP + paiement PayDunya | À faire (S1.2 / S1.9) |
| Offline-first Dexie + Service Worker | À faire (S1.5) |

---

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 14 App Router |
| Langage | TypeScript strict |
| Style | Tailwind CSS + shadcn/ui |
| State client | Zustand + React Query |
| DB locale | IndexedDB via Dexie 3.x |
| Service Worker | Workbox 7.x |
| Backend | Supabase (Postgres 15 + Edge Functions Deno) |
| Auth | OTP custom + JWT RS256 (jose) |
| SMS | Africa's Talking |
| Paiement | PayDunya |
| CDN | Supabase Storage + Bunny.net |
| Tests | Vitest + Playwright |
| Hosting | Vercel (front) · Supabase EU (back) |

---

## Quickstart

```bash
pnpm install
cp .env.example .env.local        # remplir clés
pnpm supabase start               # Postgres + Edge Functions local
pnpm dev                          # Next.js port 3000
```

---

## Commandes

```bash
# Tests
pnpm test                         # vitest watch
pnpm test:e2e                     # playwright

# DB
pnpm supabase migration new <nom>
pnpm supabase db reset

# Build
pnpm build
pnpm analyze                      # bundle analyzer

# Seed
python scripts/parser/parser.py --input data/fr.json --output data/seed_uemoa.sqlite

# Audio
bash scripts/audio/ingest.sh raw/*.wav out/
```

---

## Règles métier critiques

1. **Vitesses UEMOA :** 40 / 60 / 80 / 100 / 120 / 140 km/h — jamais les valeurs françaises
2. **Examen blanc :** 40 questions · 20s/Q · max 5 fautes (conforme ANASER) — mock 15Q en phase MVP
3. **Pass :** 4 900 FCFA · 90 jours · JWT RS256 signé serveur · validation offline
4. **Audio Wolof :** MP3 mono 32 kbps ≤ 20 Ko/fichier — pas de TTS runtime
5. **Bundle JS initial :** < 300 Ko gzipped
6. **Wording :** "préparation à l'examen", jamais "garantie de réussite"

---

## Structure

```
apps/web/
  app/                  # Routes App Router (/, /quiz, /examen, /carnet, /profil)
  components/
    dashboard/          # DashboardView, BottomNav, chips
    quiz/               # QuizView, QuizOption
    exam/               # ExamView
    carnet/             # CarnetView
  lib/
    quiz/               # Questions mock, EXAM_CONFIG, useQuestionGuards
    carnet/             # Types + mock données progression

supabase/
  migrations/           # SQL séquentielles
  functions/            # Edge Functions Deno

scripts/
  parser/               # Parseur questions FR → UEMOA (Python)
  audio/                # Pipeline ffmpeg MP3 32k mono
```

---

## Design system

Thème **Sahel Sun** — lisibilité plein soleil, Android low-end.

| Token | Valeur |
|---|---|
| `--primary` | Orange chaud `hsl(30 95% 55%)` |
| `--bg` | Blanc cassé `hsl(30 20% 97%)` |
| `--text` | Brun profond `hsl(25 20% 15%)` |
| `--success` | Vert savane `hsl(100 40% 38%)` |
| `--error` | Rouge latérite `hsl(4 65% 48%)` |

Contraste WCAG AA vérifié sur tous les éléments interactifs.

---

## Roadmap

- [ ] S1.2 — Auth OTP (Africa's Talking)
- [ ] S1.5 — Dexie schema + persistance locale
- [ ] S1.9 — Paiement PayDunya + pass 90j
- [ ] S1.14 — Dataset complet UEMOA (parseur Python · ~1 500 questions)
- [ ] S2 — Audio Wolof + PWA offline-first complet

---

## Contact

Solo dev : alfredmane94@gmail.com
