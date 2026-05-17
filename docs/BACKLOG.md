# Backlog MVP — Code Galsen (Sénégal/UEMOA)

> **Durée:** 90 jours. **Équipe:** 1 dev solo (défaut). **Stack:** Next.js 14 PWA + Supabase + PayDunya.
> **Convention ticket:** `[Sx.y] Titre — owner — estimation jours`. Status: `todo | in_progress | done | blocked`.

---

## SPRINT 0 — Prep (J-3 → J0) — hors codage Claude Code

| ID | Titre | Estim | Status | Notes |
|---|---|---|---|---|
| S0.1 | Specs verrouillées (ce doc + archi.docx) | 1j | done | livré Cowork |
| S0.2 | Parseur Python testé sur 50 questions FR | 1j | todo | `parser.py` fourni |
| S0.3 | Seed dataset v1 (10 thèmes × 5 fiches × 10 Q) | 1j | todo | bloque S1.9 |
| S0.4 | Compte Supabase + projet créé | 0.5j | todo | EU Frankfurt |
| S0.5 | Compte Africa's Talking sandbox | 0.5j | todo | crédits test 1 000 FCFA |
| S0.6 | Compte PayDunya — démarrer KYC (3 sem délai) | 0.5j | todo | bloque S3 |
| S0.7 | Compte Meta Business + WhatsApp Business API | 0.5j | todo | 2-4 sem délai |
| S0.8 | Domaine `.sn` ou `.com` réservé | 0.5j | todo | |

**Gate Sprint 0 → Sprint 1:** S0.1, S0.2, S0.3, S0.4, S0.5 done. PayDunya/WhatsApp en parallèle.

---

## SPRINT 1 — Foundation + Auth + Contenu offline (J1 → J28)

### Setup repo
- **[S1.1] Init monorepo Next.js 14 App Router + TS + Tailwind + shadcn** — 1j
- **[S1.2] Setup Supabase projet + CLI + migrations local** — 1j
- **[S1.3] CI GitHub Actions: lint + typecheck + Vercel preview** — 0.5j

### Schéma + Backend Auth
- **[S1.4] Migration `001_init.sql`: users, otp_codes, sessions, passes, payment_intents, content_versions** — 1j
- **[S1.5] Row Level Security policies Postgres** — 0.5j
- **[S1.6] Edge Function `auth-otp-request`:**
  - Input `{phone}`
  - Génère 6 digits, hash bcrypt, TTL 5min
  - Rate-limit 3/h/phone (Supabase + Upstash si besoin)
  - Africa's Talking SMS send
  - Estim: 2j
- **[S1.7] Edge Function `auth-otp-verify`:**
  - Input `{phone, code}`
  - Vérif hash + non expiré + non utilisé
  - Revoke toutes sessions actives user
  - Émet JWT RS256 access 15min + refresh 30j
  - Estim: 2j
- **[S1.8] Edge Function `auth-refresh`** — 1j
- **[S1.9] Middleware Next.js auth + httpOnly cookies** — 1j

### Frontend onboarding
- **[S1.10] UI Splash + landing** — 1j
- **[S1.11] UI Phone input (libphonenumber-js, default SN +221)** — 1j
- **[S1.12] UI OTP 6 digits + resend timer 30s** — 1j
- **[S1.13] UI Home (placeholders thèmes)** — 0.5j

### Offline + dataset
- **[S1.14] Dexie schema local (themes/activities/course_sheets/questions/options/user_progress/quiz_attempts/quiz_answers/srs_queue/app_meta)** — 1j
- **[S1.15] Script seed: parseur Python → JSON manifest + upload Supabase Storage** — 1j
- **[S1.16] Boot sequence client: fetch manifest → diff version → download → ingest IndexedDB** — 2j
- **[S1.17] Workbox SW: precache app shell + runtime cache images/audio** — 2j

### Lecteur cours
- **[S1.18] UI navigation Thèmes → Activités → Fiches** — 2j
- **[S1.19] Markdown renderer (react-markdown + custom blocks "Astuce"/"Important")** — 1j
- **[S1.20] Player audio fiche (HTML5 audio + cache stratégie SW)** — 1j

### Tests
- **[S1.21] Vitest unit: parser, jwt, srs algo** — 1j
- **[S1.22] Playwright E2E: signup → home → lecture cours offline (network: offline)** — 2j

**Livrable S1:** Auth OTP fonctionnel + cours navigables 100% offline. Pas de quiz, pas de paiement.

---

## SPRINT 2 — Quiz + Examen + SRS + Audio Wolof (J29 → J56)

### Moteur quiz
- **[S2.1] State machine quiz (XState ou Zustand) — modes training/exam** — 2j
- **[S2.2] UI Question: image, options A/B/C/D, timer 20s, feedback** — 3j
- **[S2.3] UI Examen blanc: 40 Q, chrono global, fail-at-5-fautes, écran résultat** — 2j
- **[S2.4] Algo SRS SuperMemo-2 simplifié (cf `srs.ts`)** — 2j
- **[S2.5] Carnet d'erreurs UI: liste questions ratées + relance** — 2j
- **[S2.6] ExamScore widget dashboard** — 1j

### Audio Wolof
- **[S2.7] Pipeline ingestion: script bash `ffmpeg -i in.wav -ac 1 -ab 32k out.mp3` + génération manifest** — 2j
- **[S2.8] Player audio correction quiz** — 1j

### Sync serveur
- **[S2.9] Edge Function `sync-attempts`: upload batch quiz_attempts** — 2j
- **[S2.10] Background Sync API client → retry si offline** — 1j
- **[S2.11] Page profil + stats (taux réussite, temps cumulé, ExamScore)** — 2j

### Tests + beta
- **[S2.12] Playwright E2E: training + examen blanc + sync** — 2j
- **[S2.13] Beta interne 5 testeurs Dakar (recrutement + feedback)** — parallèle

**Livrable S2:** App pédagogique complète, gratuite (paywall pas encore actif).

---

## SPRINT 3 — Paiement + Anti-partage + Support + Launch (J57 → J90)

### Paiement
- **[S3.1] Compte PayDunya prod activé (KYC validé)** — externe, pré-requis
- **[S3.2] Edge Function `payment-init`: crée payment_intent + redirect URL PayDunya** — 2j
- **[S3.3] Edge Function `webhook-paydunya`: HMAC verify + idempotence + activate pass + signe JWT pass offline** — 2j
- **[S3.4] Edge Function `payment-reconcile`: poll PayDunya API si webhook perdu** — 1j
- **[S3.5] UI paywall + écran paiement + polling status** — 2j
- **[S3.6] Bouton "Restaurer mon achat"** — 0.5j
- **[S3.7] Validation JWT pass offline (clé publique embarquée, RS256)** — 1j

### Anti-partage final
- **[S3.8] Tests multi-device: login B → session A revoked** — 0.5j
- **[S3.9] Notification "Connecté ailleurs" + écran logout forcé** — 0.5j

### Support semi-auto
- **[S3.10] Webhook WhatsApp Business: réception messages** — 1j
- **[S3.11] Bot template: classification intent (bug OTP / paiement bloqué / autre) → réponse auto** — 2j
- **[S3.12] Bouton "Contacter support" deep-link `wa.me/`** — 0.5j

### Hardening + légal
- **[S3.13] Rate-limit OTP global (Upstash Redis)** — 1j
- **[S3.14] hCaptcha signup** — 0.5j
- **[S3.15] Pages CGU / Politique confidentialité / Cookies CDP Sénégal** — 1j
- **[S3.16] Endpoint suppression compte (RGPD-like)** — 1j
- **[S3.17] Sentry + Plausible setup** — 0.5j

### Launch
- **[S3.18] Soft launch 50 users Dakar (campagne WhatsApp + auto-écoles partenaires test)** — 3j
- **[S3.19] Monitoring + hotfix bugs prod** — 4j
- **[S3.20] Tuning bundle: vérif <300Ko initial, <15Mo dataset complet** — 2j

**Livrable S3:** Production live, premiers users payants, support opérationnel.

---

## Hors MVP (Backlog v2+)

- Stripe Connect diaspora → payout Wave SN
- Codes physiques B2B2C (gestion stock + impression QR)
- Mode multi-langue Pulaar/Sérère
- App Android native via TWA (Trusted Web Activity) si stockage iOS pose problème
- TTS Wolof on-device (modèle léger embarqué)
- Tableau de bord auto-école (classement élèves)
- Système parrainage diaspora ↔ candidat

---

## Métriques succès MVP (90j)

| KPI | Cible |
|---|---|
| Users inscrits | 500 |
| Taux activation pass | 15% (75 payants) |
| Revenue MVP | 75 × 4 900 = 367 500 FCFA |
| Taux complétion 1 examen blanc | 60% des inscrits |
| Bug crash-free rate | >99% |
| Bundle initial JS | <300 Ko gzipped |
| Time to interactive 3G | <5s |
