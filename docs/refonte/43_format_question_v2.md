# 43 — Format des questions v2

Date : 2026-10-24. Statut : **proposition, à valider par Alfred**, puis implémenté en session 13.
Remplace le format v1.1 (`apps/web/lib/quiz/types.ts`). Base : 40 (Ornikar) et 42 (taxonomie).

## 1. Ce qui change par rapport à v1.1

| v1.1 | v2 |
|---|---|
| 1 seule bonne réponse (`correctId`) | 1 **ou plusieurs** bonnes réponses |
| Toujours 4 options | 2 à 4 options |
| Une question = une demande | Question **double** possible (2 sous-questions sur la même photo) |
| `theme` en texte libre | `theme` + `chapter` (ids de 42) |
| `sign` (panneau SVG) | `media` : photo ou panneau, avec repère optionnel |
| `explanation` | `explanation` + `common_mistake` |
| `draft` / `published` | `draft` / `reviewed` / `published` + trace de validation |

## 2. Schéma

```ts
interface QuestionV2 {
  id: string                 // "t04-c02-0007" : chapitre + numéro, jamais réutilisé
  theme: string              // "t04"
  chapter: string            // "t04-c02"

  media?: {
    kind: 'photo' | 'sign'
    src: string              // "t04/t04-c02-0007.webp" (chemin dans content/media/)
    alt: string              // description pour lecteur d'écran, obligatoire
    credit: string           // auteur de la photo (droits)
    marker?: { x: number; y: number }  // repère en % de l'image (0-100), ex. épingle sur la moto
    badge?: 'moto' | 'pieton' | 'charrette' | 'bus' | 'camion' | 'animal'  // pictogramme en coin
  }

  parts: [Part] | [Part, Part]   // 1 = question simple, 2 = question double

  explanation: string        // pourquoi, en 1 à 3 phrases
  common_mistake?: string    // l'erreur fréquente, en 1 phrase

  legal_ref: string | null   // "Décret 2004-13 art. 28" ; null si pas réglementaire
  legal_status: 'confirmed' | 'pending' | 'not_regulatory'
  status: 'draft' | 'reviewed' | 'published'
  review?: { moniteur?: string; juriste?: string }  // dates ISO de validation
}

interface Part {
  text: string               // "Je peux dépasser cette charrette :"
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[]  // 2 à 4
  correct: ('A' | 'B' | 'C' | 'D')[]                       // au moins 1
  shuffle?: boolean          // défaut true ; false pour OUI/NON et les listes ordonnées
}
```

Le type d'affichage se déduit, rien à saisir :
- 1 part et 1 bonne réponse → « Une seule réponse » ;
- plus d'une bonne réponse → « Plusieurs réponses » ;
- 2 parts → question double, lettres A/B puis C/D.

## 3. Règles de correction

- Une question est **juste seulement si toutes les cases cochées sont exactement les bonnes** (comme à l'examen). Pas de demi-point.
- Question double : les 2 parties doivent être justes.
- En examen blanc : pas de correction avant la fin. En entraînement et série thématique : correction après chaque question.

## 4. Règles de publication (vérifiées automatiquement au build)

1. `status: 'published'` exige `review.moniteur`.
2. `legal_status: 'confirmed'` exige `legal_ref` non nul **et** `review.juriste`.
3. `legal_status: 'pending'` interdit `published` (chiffre ou règle non confirmé).
4. `media.alt` et `media.credit` obligatoires dès qu'il y a un média.
5. `media.marker` : `x` et `y` entre 0 et 100.
6. 2 à 4 options par partie, au moins 1 bonne réponse, ids d'options uniques.
7. `theme` et `chapter` existent dans la taxonomie (42).
8. `id` unique et préfixé par son chapitre.

L'app n'affiche que les questions `published` (en développement : toutes, avec un badge « brouillon »).

## 5. Exemples

**Simple, photo avec repère**
```json
{
  "id": "t04-c02-0001",
  "theme": "t04",
  "chapter": "t04-c02",
  "media": {
    "kind": "photo",
    "src": "t04/t04-c02-0001.webp",
    "alt": "Feu rouge à Dakar, une moto Jakarta se faufile à droite de la voiture",
    "credit": "Relais Code Galsen",
    "marker": { "x": 78, "y": 55 },
    "badge": "moto"
  },
  "parts": [{
    "text": "Avant de tourner à droite au feu vert, je dois d'abord :",
    "options": [
      { "id": "A", "text": "regarder dans mon rétroviseur droit" },
      { "id": "B", "text": "tourner la tête vers la droite" },
      { "id": "C", "text": "klaxonner pour que la moto recule" }
    ],
    "correct": ["A", "B"]
  }],
  "explanation": "Les motos remontent souvent la file par la droite. Le rétroviseur ne suffit pas : un coup d'œil par-dessus l'épaule couvre l'angle mort.",
  "common_mistake": "Tourner en se fiant au seul rétroviseur.",
  "legal_ref": null,
  "legal_status": "not_regulatory",
  "status": "draft"
}
```

**Double OUI/NON**
```json
{
  "id": "t04-c03-0001",
  "theme": "t04",
  "chapter": "t04-c03",
  "media": { "kind": "photo", "src": "t04/t04-c03-0001.webp", "alt": "Charrette tirée par un cheval sur une route à deux voies", "credit": "Relais Code Galsen" },
  "parts": [
    { "text": "Je peux dépasser cette charrette maintenant :", "options": [{ "id": "A", "text": "OUI" }, { "id": "B", "text": "NON" }], "correct": ["B"], "shuffle": false },
    { "text": "Le cheval peut réagir au bruit de mon klaxon :", "options": [{ "id": "C", "text": "OUI" }, { "id": "D", "text": "NON" }], "correct": ["C"], "shuffle": false }
  ],
  "explanation": "La route n'est pas dégagée assez loin devant pour dépasser. Un cheval peut s'écarter brusquement s'il a peur : on évite le klaxon et on laisse de la place.",
  "legal_ref": null,
  "legal_status": "not_regulatory",
  "status": "draft"
}
```

## 6. Stockage

- Un fichier JSON **par chapitre** : `apps/web/content/questions/t04-c02.json`. Plus facile à relire par lots et à télécharger par thème.
- Photos : `apps/web/content/media/t04/…webp`, largeur 800 px, qualité ~70, cible ≤ 60 Ko.
- Le contenu gratuit (thème t04 + 1 examen blanc) est inclus dans l'app ; le reste se télécharge par thème (session 18).

## 7. Migration des 14 questions (session 13)

- `correctId: "b"` → `parts[0].correct: ["B"]`, options renommées A-D.
- `theme` → `theme` + `chapter` selon la table de 42.
- `sign` → `media: { kind: "sign", … }` (le SVG reste en attendant la photo).
- `legal_ref: null` + chiffre → `legal_status: "pending"`.
- Tout reste `draft`.
