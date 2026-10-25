# 46 — Charte design : une appli qui a l'air faite par des gens

Date : 2026-10-24. Statut : **proposition, à valider par Alfred**. Appliquée à partir de la session 14 (écran question), étendue en session 19.
Base : 40 (Ornikar), 44 (ton). Objectif : qu'un élève de Dakar se dise « c'est fait pour moi », pas « c'est une appli générée ».

## 1. Ce qui fait « appli IA » (à bannir)

- Dégradés violets ou bleus, effets verre flou, ombres partout, cartes qui flottent.
- Emojis utilisés comme icônes (✨ 🚀 🎯), mots « boostez », « maîtrisez », « intelligent ».
- Police à chasse fixe (type code) dans l'interface : on retire JetBrains Mono.
- Tout centré, tout arrondi, beaucoup de vide sans contenu.
- Faux chiffres et faux prénoms (« Bonjour Amadou », « 12 h cumulées »).
- Illustrations génériques de stock ou générées par IA.

## 2. Ce qui fait « humain » (à suivre)

- **La photo d'abord** : chaque question part d'une vraie photo prise au Sénégal, siège conducteur (brief 45). C'est 80 % de l'effet Ornikar.
- **Le repère** : une épingle ou un cercle sur la photo montre quoi regarder.
- **Des mots du pays** : Jakarta, car rapide, Ndiaga Ndiaye, clando, VDN, hivernage.
- **Un ton de moniteur** : direct, bienveillant, jamais moqueur (« Pas tout à fait. Les motos remontent souvent par la droite. »).
- **Des pictos simples** au trait (moto, piéton, charrette, bus) dessinés une fois, toujours les mêmes.

## 3. Palette

On garde la base actuelle (papier crème + orange) et on ajoute une couleur de structure. Ornikar = aubergine ; nous = **vert profond**, couleur de route et de baobab, lisible au soleil.

| Rôle | Couleur | Usage |
|---|---|---|
| Fond | Crème `#F7F3EE` (existant) | fond de toutes les pages |
| Texte | Encre `#1F1B16` | texte principal, contraste fort au soleil |
| Structure | Vert profond `#1F5E4A` | en-têtes, barre du bas, lettres A/B/C/D sélectionnées |
| Action | Orange `#EA6A12` (existant) | un seul bouton d'action par écran (Valider, Suivant) |
| Juste | Vert `#2E8540` + fond doux | correction |
| Faux | Rouge brique `#B3261E` + fond doux | correction |
| Neutre | Sable `#E8DFD2` | bordures, réponses non cochées |

Règle : une seule couleur vive par écran (l'orange). Juste/faux toujours accompagnés d'un mot ou d'une icône (daltonisme).

## 4. Typographie

- Une seule police : **Plus Jakarta Sans** (déjà chargée, hors ligne via `next/font`).
- Question : 18 px, gras. Réponses : 16 px. Explication : 15 px. Jamais en dessous de 14 px.
- Pas de majuscules sur des phrases entières, sauf OUI / NON.

## 5. Écran question (modèle Ornikar adapté)

```
┌──────────────────────────────┐
│ ← Série « Motos »     7 / 20 │  en-tête vert, compteur
├──────────────────────────────┤
│                              │
│   PHOTO plein largeur 16:9   │  repère sur la photo, picto en coin
│                              │
├──────────────────────────────┤
│ Avant de tourner à droite,   │  question en gras
│ je dois d'abord :            │
│ ┌──┐ regarder mon rétro droit│  lettre carrée A/B/C/D
│ ┌──┐ tourner la tête         │  cible ≥ 44 px
│ ┌──┐ klaxonner               │
├──────────────────────────────┤
│ Plusieurs réponses  [Valider]│  barre fixe, bouton orange
└──────────────────────────────┘
```

Après validation (entraînement) : bandeau « Juste » ou « Pas tout à fait », explication, erreur fréquente, bouton « Suivant ». En examen blanc : aucune correction avant la fin.

## 6. Illustrations

- V1 : photos réelles + pictos au trait. Pas d'illustration décorative.
- Plus tard (si budget) : un illustrateur sénégalais pour les écrans d'accueil et de fin d'examen. Jamais d'image générée par IA.

## 7. Textes d'interface

- Tutoiement dans l'interface (« Écris-nous sur WhatsApp »), « je » dans les questions, « vous » dans les explications (44).
- Verbes simples : « Commencer », « Valider », « Suivant », « Revoir mes erreurs ».
- Jamais : « garanti », « officiel », « conforme à l'examen ».

## 8. Vérification

Avant chaque PR d'écran : capture sur un petit Android en plein soleil (ou luminosité max). Si on hésite à lire, on corrige.
