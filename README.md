# Code Galsen

PWA offline-first préparation code de la route Sénégal/UEMOA. Pass 90j à 4 900 FCFA via Mobile Money.

→ Lire `CLAUDE.md` (brief technique) et `docs/BACKLOG.md` (50+ tickets) avant tout dev.

## Stack
Next.js 14 PWA · Supabase (Postgres + Edge Fn) · PayDunya · Africa's Talking · Vercel.

## Quickstart
```bash
pnpm install
cp .env.example .env.local      # remplir clés
pnpm supabase start             # lance Postgres + Edge Fn local
pnpm dev                        # Next.js port 3000
```

## Tests
```bash
pnpm test                       # vitest
pnpm test:e2e                   # playwright
python scripts/parser/test_parser.py
```
