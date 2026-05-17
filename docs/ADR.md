# Architecture Decision Records — Code Galsen

> Format MADR léger. 1 fichier = N décisions chronologiques pour MVP.
> Destination repo : `docs/decisions/ADR-XXX-titre.md` (1 par fichier en prod).

---

## ADR-001 — Next.js 14 PWA plutôt que Flutter Web

**Statut :** Accepté · 2026-05-17
**Décideurs :** Lead dev (solo)

### Contexte
Le cahier des charges initial recommande Flutter (ou FlutterFlow) compilé en PWA. Cible : Android low-end 4 Go RAM, réseau 3G fluctuant, bundle ≤ 15 Mo, time-to-interactive < 5 s.

### Décision
**Next.js 14 App Router en TypeScript, compilé en PWA via Workbox.**

### Conséquences
**Positives**
- Bundle initial < 300 Ko gzipped possible (Flutter Web minimum ~2 Mo wasm + canvas-kit).
- Écosystème PWA mature (Workbox, IndexedDB, Background Sync).
- Skill TS/React plus largement disponible si scale équipe.
- HMR ultra-rapide, DX supérieure pour solo dev.

**Négatives**
- Si V2 vise app native iOS, refactor Flutter eût été plus direct. Mitigation : V2 = TWA Android natif (déjà PWA, pas de refactor).
- Pas de support Skia natif → animations 60fps complexes plus dures. Mitigation : MVP n'en a pas besoin.

### Alternatives rejetées
- **Flutter Web** : bundle trop lourd, anti-pattern offline-first sur 3G.
- **React Native + Expo Web** : double bundle, plus de complexité solo.
- **SvelteKit** : moins d'écosystème PWA mature, recrutement plus difficile.

---

## ADR-002 — Supabase plutôt que backend self-hosted

**Statut :** Accepté · 2026-05-17

### Contexte
Backend solo, 90 jours, infra à pousser en prod fiable sans DevOps dédié.

### Décision
**Supabase (Postgres + Edge Functions Deno + Storage + Auth optionnel) en région EU Francfort.**

### Conséquences
**Positives**
- Postgres relationnel (vs Firestore NoSQL) cohérent avec le schéma actuel.
- Auth custom OTP via Edge Functions, pas de fournisseur tiers en plus.
- RLS native, sécurité serveur sans rouler son own middleware.
- Tier gratuit suffit (< 500 Mo DB, 1 Go Storage, 500k Edge Fn invocations/mois).
- Latence Francfort → Dakar : ~140 ms acceptable, mieux que US-East.

**Négatives**
- Vendor lock-in modéré. Mitigation : SQL standard, migrations versionnées. Sortie possible vers Postgres self-hosted.
- Edge Functions Deno : runtime différent de Node, courbe d'apprentissage.
- Pas de support Africa francophone direct. Latence Lagos AWS ouverte si besoin futur.

### Alternatives rejetées
- **Firebase** : NoSQL inadapté + lock-in plus fort.
- **VPS Hetzner Paris + Node + Postgres** : DevOps trop coûteux solo (sauvegardes, monitoring, updates).
- **AWS Amplify** : facturation imprévisible, complexité IAM.

---

## ADR-003 — Anti-partage par single-session serveur plutôt que device fingerprinting

**Statut :** Accepté · 2026-05-17

### Contexte
Risque produit majeur : partage massif d'un compte payant entre cercles familiaux. Le cahier des charges propose un fingerprinting matériel.

### Décision
**Une session active maximum par utilisateur, enforced via trigger Postgres révoquant toutes les autres sessions à l'INSERT.**

### Mécanique
```
INSERT INTO sessions(...) → trigger
  UPDATE sessions SET revoked_at=NOW()
  WHERE user_id=NEW.user_id AND jti != NEW.jti AND revoked_at IS NULL;
```
Le client refresh son JWT toutes 14 minutes. Si serveur répond "revoked", logout forcé.

### Conséquences
**Positives**
- 100 % fiable, indépendant du navigateur.
- Trigger SQL = code minimal, code de produit zéro.
- Anti-partage strict : impossible d'utiliser le compte simultanément sur 2 devices.

**Négatives**
- Friction si user a 2 devices personnels (téléphone + tablette familiale). Mitigation : ce n'est pas le cas de la cible MVP.
- Si user clear ses cookies souvent, doit re-OTP. Mitigation : refresh token 30 j en httpOnly cookie.

### Alternatives rejetées
- **FingerprintJS** : empreinte instable en PWA (clear data = nouveau device). Faux positifs nombreux.
- **Pas d'anti-partage** : risque commercial inacceptable (économie sénégalaise = forte mutualisation).
- **Watermarking visuel des questions** : complexe, casse l'UX.

---

## ADR-004 — PayDunya comme agrégateur Mobile Money (vs intégration directe)

**Statut :** Accepté · 2026-05-17 (en attente KYC pour confirmer)

### Contexte
Cible Sénégal : Wave (~50 % marché) + Orange Money (~40 %) + Free Money (~10 %). Intégration directe = 2-3 APIs à maintenir avec idempotence et webhooks indépendants.

### Décision
**PayDunya comme agrégateur unique. SenePay en plan B si KYC PayDunya rejeté.**

### Conséquences
**Positives**
- 1 API, 1 webhook, 1 doc.
- Commissions correctes (~2-3 % par transaction).
- Support sandbox.
- Couvre tout l'UEMOA, utile si extension Mali/Côte d'Ivoire.

**Négatives**
- Dépendance fournisseur tiers (downtime PayDunya = paiement off).
- Commission > intégration directe (sur 4 900 FCFA, ~150 FCFA de commission).
- KYC peut prendre 3 semaines, bloquant Sprint 3.

### Alternatives rejetées
- **Intégration directe Wave API + Orange Money API** : double maintenance, 2× idempotence à gérer.
- **Stripe** : ne couvre pas Mobile Money sénégalais.
- **CinetPay** : alternative, retenue comme plan C si PayDunya + SenePay tous deux rejettent.

---

## ADR-005 — Audio Wolof statique MP3 plutôt que TTS runtime

**Statut :** Accepté · 2026-05-17

### Contexte
Application bilingue FR + Wolof. Le wolof n'a pas de TTS de qualité production sur le jargon juridique routier en 2026.

### Décision
**Fichiers audio MP3 statiques pré-enregistrés (voix-off humaine), mono, 32 kbps, ≤ 20 Ko par fichier.**

### Conséquences
**Positives**
- Qualité voix humaine garantie (jargon juridique précis).
- 0 ms latence (fichier local après premier download).
- Coût marginal nul à la lecture (pas d'API par minute).

**Négatives**
- Coût de production initial : studio + comédien voix-off + relecture experte. Estimation 200 000 à 500 000 FCFA pour 30 fiches MVP.
- Pas dynamique : ajout d'une nouvelle fiche = nouvelle session studio.
- Stockage : 200 fiches × 20 Ko = 4 Mo, OK dans la cible 15 Mo bundle.

### Alternatives rejetées
- **TTS Google/Azure/ElevenLabs** : pas de voix wolof de qualité, prononciation jargon technique fausse.
- **TTS embarqué on-device** : aucun modèle wolof léger en 2026.
- **Pas d'audio Wolof MVP** : retenue comme plan B si budget studio refusé (texte-only + bouton "Demander à un proche").

---

## ADR-006 — JWT pass RS256 offline plutôt que call serveur à chaque ouverture

**Statut :** Accepté · 2026-05-17

### Contexte
Réseau Sénégal intermittent. User payant doit pouvoir ouvrir l'app et accéder à ses fonctionnalités payantes sans connexion.

### Décision
**À l'activation d'un pass, le serveur signe un JWT RS256 contenant `{user_id, pass_id, exp=+90j}` et le retourne au client. Le client le stocke dans IndexedDB (`app_meta.pass_jwt`). À chaque ouverture, le client vérifie la signature avec la clé publique embarquée dans le bundle.**

### Conséquences
**Positives**
- Accès payant 100 % offline pendant 90 jours.
- Aucun call serveur requis pour vérifier la validité.
- Signature RS256 = clé publique safe à embarquer dans le bundle (ne peut pas signer).

**Négatives**
- Pas de révocation immédiate côté serveur (si refund). Mitigation : durée max 90 j, refund = manuel dans la fenêtre.
- Si user change l'heure système, JWT exp peut être contourné. Mitigation : on accepte ce risque (négligeable, et serveur revalide à chaque sync).
- Clé privée serveur doit être protégée (Supabase Vault).

### Alternatives rejetées
- **Call serveur à chaque ouverture** : offline cassé, première contrainte produit non respectée.
- **HMAC partagé** : clé partagée = compromise sur 1 device = compromise tout.
- **DRM strict** : surdimensionné pour un produit à 4 900 FCFA.

---

## ADR-007 — Pas de gestion CMS / back-office en MVP

**Statut :** Accepté · 2026-05-17

### Contexte
Le contenu (thèmes, fiches, questions) évolue lentement. Construire un CMS = 2-3 semaines de dev dégoulinant Sprint 1.

### Décision
**Aucun back-office MVP. Contenu géré comme du code : fichiers JSON versionnés dans `apps/web/content/`, ingestion via script Python parseur, manifeste pushé sur Supabase Storage à chaque release.**

### Conséquences
**Positives**
- Zéro UI à coder.
- Versionning git natif du contenu.
- Diffs en revue de code (qualité).

**Négatives**
- Toute correction de typo = redeploy. Mitigation : OTA via `content_versions.is_current` + diff manifest côté client, pas besoin d'un redeploy app pour pousser du contenu (juste un push storage).
- Non-techs (formateur auto-école) ne peuvent pas éditer directement. Mitigation : Google Sheet partagé → script Python convertit en JSON.

### Alternatives rejetées
- **Strapi/Directus self-hosted** : DevOps coûteux solo.
- **Sanity** : facturation utilisateur, complexité inutile MVP.
- **Notion comme CMS** : API rate-limits, mauvais pour 2 000+ entrées.

---

## Template ADR (pour les futurs)

```markdown
# ADR-XXX — Titre court (décision en 1 ligne)

**Statut :** Proposé | Accepté | Déprécié | Remplacé par ADR-YYY
**Date :** YYYY-MM-DD
**Décideurs :** noms

## Contexte
Pourquoi la décision se pose. Contraintes en jeu.

## Décision
Ce qu'on fait. Phrase en gras.

## Conséquences
- Positives : ...
- Négatives : ...

## Alternatives rejetées
- Option B : pourquoi non.
- Option C : pourquoi non.
```
