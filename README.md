# Code Galsen

PWA mobile-first, hors ligne, pour préparer l'examen théorique du permis **B** au **Sénégal**. Français uniquement en V1.

**Modèle :** 4 900 FCFA · 90 jours · paiement Wave (lien de paiement Business), activation par code. Gratuit : 1 thème + 1 examen blanc.

Préparation à l'examen : ne remplace pas l'auto-école et ne délivre aucun certificat.

> Décisions produit et techniques : voir [CLAUDE.md](CLAUDE.md). Le dossier `docs/` décrit l'ancienne architecture, qui n'est plus valide.

---

## Fonctionnalités MVP (état actuel)

| Écran | État |
|---|---|
| Dashboard — parcours, progression, chips | ✅ (données mock) |
| Quiz libre — 10 questions mock, feedback immédiat | ✅ |
| Examen blanc — timer, compteur fautes, résultat (`EXAM_CONFIG` paramétrable) | ✅ |
| Carnet — dernier score, taux moyen, thèmes faibles | ✅ (données mock) |
| Profil | Stub — à venir |
| Activation par code + licence signée | À faire |
| Hors ligne (service worker) + progression localStorage | À faire |

---

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 14 App Router |
| Langage | TypeScript strict |
| Style | Tailwind CSS |
| État client | `useState` + hooks maison (`useProgress`) |
| Progression | localStorage |
| Hors ligne | Service worker (app + contenu précachés) |
| Contenu | JSON dans le repo (`apps/web/content`), schéma v1.1 — pas de CMS ni de base de données |
| Panneaux | Composants SVG inline |
| Backend | 1 Edge Function Supabase (activation) + table `licenses` |
| Licence | Signature ed25519, vérification hors ligne par clé publique embarquée |
| Paiement | Wave (lien de paiement Business) |
| Tests | Vitest + Playwright |
| Hébergement | Vercel |

---

## Quickstart

```bash
pnpm install
cp .env.example .env.local        # remplir les clés
pnpm --filter web dev             # http://localhost:3000
```

---

## Commandes

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test            # vitest
pnpm --filter web test:e2e        # playwright
```

---

## Règles métier critiques

1. **Contenu :** aucun chiffre légal sans source. Chaque question porte un `legal_ref`. Valeurs non confirmées (vitesses, taux d'alcool, format officiel de l'examen) : ne pas inventer, laisser en `draft`.
2. **Publication :** statut `published` seulement après relecture d'un moniteur (et du juriste pour les items réglementaires).
3. **Examen blanc :** `EXAM_CONFIG` paramétrable. Ne pas afficher « conforme à l'examen officiel » tant que ce n'est pas confirmé.
4. **Licence :** code à usage unique lié à un appareil, licence signée vérifiée hors ligne. Clé privée uniquement dans les secrets Supabase.
5. **Bundle JS initial :** < 300 Ko gzip. Fonctionne en mode avion après la première visite.
6. **Wording :** « préparation à l'examen », jamais « garantie de réussite ».

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
  content/              # Questions JSON (source de vérité contenu)
  lib/
    quiz/               # Questions mock, EXAM_CONFIG, useQuestionGuards, srs
    carnet/             # Types + mock données progression

supabase/
  migrations/           # SQL (à réduire à la table licenses)
  functions/            # Edge Function d'activation (à venir)
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

- [x] Nettoyage : retrait OTP, PayDunya, JWT, Zustand, React Query, Dexie
- [ ] Progression locale (`useProgress` + localStorage)
- [ ] Contenu JSON schéma v1.1 avec `legal_ref`, relu par un moniteur
- [ ] Activation : code unique → Edge Function → licence ed25519 liée à l'appareil
- [ ] Vérification de licence hors ligne + verrouillage gratuit / payant
- [ ] Service worker : app + contenu précachés, mode avion

Reporté (hors V1) : audio Wolof, moto, UEMOA, comptes utilisateurs.

---

## Contact

Solo dev : alfredmane94@gmail.com
