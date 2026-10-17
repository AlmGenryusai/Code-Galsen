# CLAUDE.md — Code Galsen

> Lu automatiquement par Claude Code. Source des décisions : `/refonte/26-29` (projet Claude) — résumées ici.

## Produit

PWA mobile-first, hors ligne, préparation à l'examen théorique du permis **B** au **Sénégal**. Français uniquement en V1.

- Prix : **4 900 FCFA / 90 jours**, paiement Wave (lien de paiement Business), activation par code.
- Gratuit : 1 thème + 1 examen blanc. Payant : tout le reste.
- Cible terrain : Android d'entrée de gamme, réseau faible, peu de RAM.
- Ne remplace pas l'auto-école (obligatoire, loi 2022-04). Ne délivre aucun certificat.
- Wording : « préparation à l'examen », jamais « garantie de réussite ».

## Architecture MVP (verrouillée)

```
Git (JSON questions validées) → build → Next.js PWA (Vercel)
                                         ├─ service worker : app + contenu précachés
                                         ├─ progression : localStorage
                                         └─ activation → 1 Edge Function Supabase → table `licenses`
```

- Next.js 14 App Router, TypeScript strict, Tailwind.
- État : `useState` + hooks maison (`useProgress`). **Pas** de Zustand, React Query, Dexie.
- Contenu : JSON dans le repo, schéma v1.1. Pas de CMS, pas de base de données pour le contenu.
- Panneaux : composants SVG inline, légers, aucune photo.
- Serveur : uniquement l'activation des licences. Rien d'autre côté backend en V1.

### Supprimé / reporté (ne pas réintroduire sans décision)
OTP SMS, Africa's Talking, JWT RS256 custom + single-session, PayDunya, Zustand, React Query, Dexie, Bunny.net, Sentry, audio Wolof, moto, UEMOA, comptes utilisateurs.

## Licences / anti-partage

1. Code unique à usage unique (ex. `GALS-7K3P-9QXM`), généré par un script admin local.
2. À l'activation, l'app génère une clé d'appareil (stockée localement). Le serveur lie code + appareil et renvoie une licence signée (ed25519 : date de fin + identifiant appareil).
3. Vérification **hors ligne** par clé publique embarquée.
4. Code déjà lié → refusé sur un autre appareil. 1 transfert manuel autorisé.
5. Clé privée de signature : uniquement dans les secrets Supabase, jamais dans le repo.

## Contenu : règles absolues

- **Aucun chiffre légal sans source.** Chaque question porte un `legal_ref` (article de loi ou décret).
- Textes de référence : loi 2022-04 (nouveau code, décret d'application en attente), décret 2004-13 (en vigueur). Fiche de vérité : `refonte/27_fiche_regles_senegal.md`.
- Valeurs non confirmées à ce jour : vitesses en agglomération et hors agglomération, taux d'alcool, format officiel de l'examen. **Ne pas inventer.** Laisser la question en `draft`.
- Statut `published` seulement après relecture d'un moniteur et validation du juriste pour les items réglementaires.
- Pédagogie : situations réelles (motos, charrettes, transports en commun), causalité, erreurs fréquentes, lecture rapide sur mobile. Pas de distracteurs absurdes.
- `EXAM_CONFIG` reste paramétrable : ne pas afficher « conforme à l'examen officiel » tant que ce n'est pas confirmé.

## Contraintes performance

- JS initial < 300 Ko gzip. Pas de dépendance lourde sans justification.
- Cibles tactiles ≥ 44 px, garde anti double-tap (`useQuestionGuards`).
- Doit fonctionner en mode avion après la première visite.

## Façon de travailler

- **Mode plan d'abord** : proposer un plan court, attendre validation, puis exécuter.
- 1 session = 1 tâche du plan `29_plan_mvp.md`. Ne pas déborder sur la suivante.
- Pas d'over-engineering : pas d'abstraction « pour plus tard », pas de nouveau script ou outil non demandé, pas de nouvelle dépendance sans le dire.
- Commits petits, Conventional Commits.
- Avant de finir : `pnpm --filter web typecheck`, `pnpm --filter web lint`, `pnpm --filter web test`.
- Réponses courtes, en français.

## Commandes

```bash
pnpm install
pnpm --filter web dev        # http://localhost:3000
pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test
```

## Structure

```
apps/web/
  app/          # routes : / , /quiz, /examen, /carnet, /profil
  components/   # dashboard, quiz, exam, carnet
  content/      # questions JSON (source de vérité contenu)
  lib/quiz/     # srs.ts, exam-config.ts, use-question-guards.ts
supabase/       # (à réduire) migrations + fonction d'activation
docs/           # specs historiques — l'ancienne archi y est décrite, elle n'est plus valide
```
