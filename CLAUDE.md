# CLAUDE.md — Code Galsen (Auto-école Sénégal/UEMOA)

> **Important:** ce fichier va à la racine du repo Git. Claude Code le lit automatiquement à chaque session. Ne pas supprimer.

## Contexte projet

Micro-SaaS EdTech, préparation théorique au code de la route Sénégal/UEMOA. PWA mobile-first, offline-first. Livraison 90j, équipe 1 dev.

**Modèle:** Pass Réussite 4 900 FCFA / 90j, paiement Mobile Money (Wave/Orange Money).

**Non-objectifs:**
- Ne remplace pas auto-école physique (illégal au Sénégal)
- Ne délivre aucun certificat officiel
- Pas d'IA en temps réel (TTS, vision, etc.) — coût + latence inacceptables

## Stack technique verrouillée

| Layer | Choix | Version |
|---|---|---|
| Framework | Next.js | 14.x App Router |
| Langage | TypeScript | strict mode |
| Style | Tailwind + shadcn/ui | — |
| State client | Zustand + React Query (TanStack) | — |
| DB locale | IndexedDB via Dexie | 3.x |
| Service Worker | Workbox | 7.x |
| Backend | Supabase | Postgres 15 + Edge Functions (Deno) |
| Auth | Custom OTP + JWT RS256 (jose) | — |
| SMS | Africa's Talking | — |
| Paiement | PayDunya (fallback SenePay) | — |
| Storage media | Supabase Storage + Bunny.net CDN | — |
| Tests | Vitest + Playwright | — |
| Lint/format | ESLint + Prettier + Husky | — |
| CI | GitHub Actions | — |
| Hosting | Vercel (front) + Supabase EU (backend) | — |
| Monitoring | Sentry + Plausible | — |

**Interdits stack:**
- Flutter (bundle PWA trop lourd pour Android low-end visé)
- Firebase (NoSQL inadapté schéma relationnel)
- TTS API temps réel (latence + qualité Wolof)
- Fingerprinting matériel (PWA = pas fiable, anti-partage côté serveur seulement)
- localStorage pour données sensibles (utiliser httpOnly cookies + IndexedDB chiffré si besoin)

## Structure repo

```
/
├── apps/
│   └── web/                    # Next.js 14 PWA
│       ├── app/                # App Router
│       ├── components/
│       ├── lib/
│       │   ├── db/             # Dexie schema + queries
│       │   ├── auth/           # JWT, session client
│       │   ├── quiz/           # state machine + SRS
│       │   └── payment/        # PayDunya client
│       ├── public/
│       │   └── sw.js           # Workbox SW build output
│       └── workers/            # Background Sync handlers
├── supabase/
│   ├── migrations/             # SQL séquentielles 001_*.sql
│   ├── functions/              # Edge Functions Deno
│   │   ├── auth-otp-request/
│   │   ├── auth-otp-verify/
│   │   ├── auth-refresh/
│   │   ├── payment-init/
│   │   ├── webhook-paydunya/
│   │   ├── payment-reconcile/
│   │   └── sync-attempts/
│   └── config.toml
├── scripts/
│   ├── parser/                 # Python parseur code FR → UEMOA
│   │   ├── parser.py
│   │   ├── requirements.txt
│   │   └── fixtures/
│   └── audio/
│       └── ingest.sh           # ffmpeg pipeline MP3 32k mono
├── packages/                   # si besoin extraire libs partagées (pas avant S2)
├── docs/
│   ├── archi.md
│   └── decisions/              # ADR (Architecture Decision Records)
├── .github/workflows/
├── CLAUDE.md                   # ce fichier
├── README.md
└── package.json                # workspaces pnpm
```

## Conventions code

- **Imports:** absolus via `@/` alias
- **Composants:** PascalCase, 1 par fichier, suffixe `.tsx`
- **Hooks:** préfixe `use`, dossier `lib/hooks/`
- **API routes Next:** éviter — utiliser Supabase Edge Functions sauf BFF léger
- **Naming SQL:** snake_case, tables au pluriel
- **i18n:** clés FR par défaut, structure `{fr: '...', wo: '...'}`. Wolof = texte si traduit, fallback FR sinon.
- **Erreurs:** classe `AppError` avec `code` + `message`. Jamais throw raw Error en prod.
- **Logs:** `pino` côté Edge Functions. Pas de `console.log` committed.

## Commandes utiles

```bash
# Dev
pnpm dev                          # Next.js dev server
pnpm supabase start               # Postgres + Edge Functions local
pnpm supabase functions serve     # hot reload functions

# DB
pnpm supabase migration new <nom>
pnpm supabase db reset
pnpm supabase db push             # apply migrations vers prod

# Tests
pnpm test                         # vitest watch
pnpm test:e2e                     # playwright
pnpm test:e2e:offline             # tests scénario offline

# Build
pnpm build
pnpm analyze                      # @next/bundle-analyzer

# Seed
python scripts/parser/parser.py --input data/fr.json --output data/seed_uemoa.sqlite
node scripts/upload_seed.ts       # push manifest Supabase Storage

# Audio
bash scripts/audio/ingest.sh raw/*.wav out/

# Déploiement
git push                          # Vercel auto-deploy preview
pnpm supabase functions deploy <name>
```

## Règles métier critiques (à ne PAS oublier)

1. **Vitesses UEMOA:** 40 / 60 / 80 / 100 / 120 / 140 km/h. Jamais 30/50/110/130.
2. **Filtrer:** neige, verglas, Loi Montagne, ZFE, Crit'Air, vignettes écologiques.
3. **Inclure:** motos (38% accidents Sénégal), charrettes, transports collectifs informels, signalisations branches arbres.
4. **Audio Wolof = statique MP3 mono 32kbps ≤ 20 Ko/fichier.** Pas de TTS runtime.
5. **Examen blanc:** 40 questions, 20s/Q, max 5 fautes pour valider. Conforme ANASER.
6. **Anti-partage:** single-session serveur (revoke at login). Pas de fingerprint matériel.
7. **Pass:** 4 900 FCFA, 90 jours, validation offline via JWT RS256 signé serveur, stocké local.
8. **Webhook paiement:** idempotent (provider_ref UNIQUE). Toujours réconciliable via polling.
9. **Bundle cible:** <300 Ko JS initial gzipped. <15 Mo dataset complet (questions+cours+audio).
10. **Marketing wording:** "préparation à l'examen", PAS "garantie de réussite" (risque procès).

## Schéma données (résumé)

Tables locales (IndexedDB/SQLite): `themes`, `activities`, `course_sheets`, `questions`, `options`, `user_progress`, `quiz_attempts`, `quiz_answers`, `srs_queue`, `app_meta`.

Tables serveur (Postgres): `users`, `otp_codes`, `sessions`, `passes`, `payment_intents`, `content_versions`.

Schéma complet: voir `docs/archi.md` ou `04_MIGRATIONS_SQL/`.

## Workflow Claude Code recommandé

1. **Avant chaque ticket:** lire `01_BACKLOG.md` → ouvrir ticket cible
2. **Lancer:** `pnpm dev` + `pnpm supabase start` (1 fois par session)
3. **Code:** implémenter en small commits (1 commit = 1 changement cohérent, message Conventional Commits FR ou EN)
4. **Tests:** ajouter vitest unit + playwright e2e si user-facing
5. **Lint:** `pnpm lint` avant commit (Husky pre-commit le force)
6. **Migration SQL:** `pnpm supabase migration new <desc>` puis `db reset` pour rejouer
7. **Edge Function:** test local via `supabase functions serve` + curl. Deploy via `supabase functions deploy <nom>`
8. **PR:** une PR par sous-ticket. Description = "Closes S1.x". CI doit passer.

## Sécurité — checklist

- [ ] Secrets jamais committed (`.env.local` gitignored, secrets Vercel + Supabase)
- [ ] JWT signing key RS256 stockée Supabase Vault, jamais en code
- [ ] RLS Postgres activée sur toutes tables avec données user
- [ ] HMAC webhook PayDunya vérifié systématiquement
- [ ] Rate-limit OTP request 3/h/phone côté Edge Function
- [ ] hCaptcha sur signup
- [ ] CORS strict: `https://<domain>` only
- [ ] Headers sécurité: CSP, HSTS, X-Frame-Options DENY (Next.js middleware)
- [ ] Logs sans PII (pas de phone en clair, hash)
- [ ] Suppression compte = effacement réel + anonymisation logs

## Performance — checklist

- [ ] Next.js Image pour toute image (lazy, AVIF)
- [ ] Fonts: woff2 self-hosted, preload critique, swap
- [ ] Lighthouse mobile ≥ 90 Performance, ≥ 100 PWA
- [ ] Splitchunk: react/dexie/zustand séparés du chunk app
- [ ] Service Worker: stale-while-revalidate pour cours, cache-first pour audio
- [ ] DB queries indexées (cf migrations)
- [ ] Pas de polyfills inutiles (target ES2020+ Android Chrome)

## Décisions architecturales (ADR liens)

- ADR-001: Next.js plutôt que Flutter — bundle taille
- ADR-002: Supabase plutôt que self-hosted — vitesse MVP solo
- ADR-003: Anti-partage serveur plutôt que fingerprint — fiabilité PWA
- ADR-004: PayDunya plutôt que intégration directe Wave/OM — vitesse KYC + maintenance
- ADR-005: Audio statique MP3 plutôt que TTS — latence + qualité Wolof
- ADR-006: JWT pass RS256 offline plutôt que call serveur à chaque accès — résilience réseau

## Contact / support

Solo dev: <à remplir>
PayDunya support: <à remplir post-KYC>
Africa's Talking: <à remplir>
