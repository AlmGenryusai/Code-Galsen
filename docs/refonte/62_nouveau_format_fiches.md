# 62 — Fiches de cours en blocs (remplace le modèle du doc 47)

Date : 2026-10-25. Statut : **validé par Alfred le 2026-10-25**. Base : captures Ornikar (structure seulement, aucun contenu copié), 42, 46, 47.
Le doc 47 reste valable pour : statuts, règles légales, ton, durée max. Il est remplacé pour : « 1 fiche = 1 chapitre » et les 4 blocs fixes.

## 1. Structure

Thème (t01…t10) → **chapitre** (t04-c01) → **fiches** (t04-c01-f01…), 1 à 5 par chapitre, 1 à 4 min chacune.

| Écran | Route | Contenu |
|---|---|---|
| Liste des thèmes | `/fiches` | Une section par thème (thème gratuit en tête). Une carte par chapitre : intitulé, « N fiches », barre « x / N lues », cadenas si verrouillé. |
| Chapitre | `/fiches?c=t04-c01` | Intitulé, liste des fiches (titre, durée, coche « Lue »), bouton « M'entraîner sur ce thème ». |
| Lecture | `/fiches?c=t04-c01&f=2` | Titre, durée, blocs, barre « Fiche 2/3 », bouton « Suivant » (orange). Dernière fiche : « M'entraîner sur ce thème ». |

Verrou, `SHOW_DRAFTS`, hors ligne : inchangés (session 17).

## 2. Schéma

```ts
interface Sheet {
  id: string              // "t04-c01-f01", jamais réutilisé
  title: string           // sujet précis : « Le passage piéton », « Les balises »
  blocks: Block[]
}
interface LessonFile {    // content/lessons/<chapitre>.json
  id: string              // chapitre, "t04-c01"
  theme: string
  sheets: Sheet[]         // 1 à 5
  legal_ref: string | null
  legal_status: 'sourced' | 'pending' | 'none'
  status: 'draft' | 'reviewed' | 'published'
  review?: QuestionV2['review']
}
type Block =
  | { type: 'text';      text: string }                       // paragraphe, **gras** autorisé
  | { type: 'heading';   text: string }                       // sous-titre
  | { type: 'list';      items: string[] }
  | { type: 'attention'; text: string }                       // encadré « ATTENTION »
  | { type: 'memo';      text: string }                       // encadré « AIDE-MÉMOIRE » (1 phrase à retenir)
  | { type: 'table';     head: [string, string]; rows: { label: string; text: string; media?: Media }[] }
  | { type: 'image';     media: Media; caption?: string }
```

`Media` = type de `lib/quiz/types.ts` (alt et credit obligatoires). Le titre du chapitre vient toujours de `TAXONOMY`.
Pas de HTML libre. Pas de vidéo, pas d'animation, pas d'audio.

## 3. Règles

- Durée affichée = mots de la fiche / 200, arrondi au-dessus, minimum 1 min. **280 s max par fiche** (≈ 900 mots), cible 150-450 mots.
- Chaque fiche : au moins 1 bloc `text`, 2 blocs au plus de type `attention`/`memo`, 1 bloc `image` ou `table` seulement si le média existe.
- Aucun chiffre sans `legal_ref` (règle projet). Un chiffre dans une fiche → le chapitre reste `draft`.
- Style : « je » conducteur, causalité, scène sénégalaise, ton moniteur (doc 44). Pas de copie de texte tiers : les fiches sont écrites pour nous.
- Progression : `lessons: Record<ficheId, ISO>` (1re date conservée). Les anciennes clés « chapitre » (session 17) sont ignorées sans erreur.
- Chapitre « lu » = toutes ses fiches lues.

## 4. Plan t04 (thème gratuit) : 15 fiches

Les 5 fiches de la session 17 deviennent la fiche f01 de chaque chapitre (texte repris, découpé en blocs). Les autres sont à rédiger en lot, après la session 18.

| Chapitre | f01 (existante) | f02 | f03 |
|---|---|---|---|
| t04-c01 Piétons | Piétons : la règle de base | Passage piéton et sortie d'école | Piétons hors passage, la nuit |
| t04-c02 Motos et Jakarta | Motos : l'angle mort | Remontée de file | Ouvrir sa portière, tourner |
| t04-c03 Charrettes et animaux | Charrettes : ralentir | Dépasser une charrette | Troupeaux et animaux sur la route |
| t04-c04 Transports en commun | Cars rapides, Ndiaga : la distance | Arrêts brusques et passagers | Taxis et bus : les gestes |
| t04-c05 Poids lourds | Camions : être vu | Angles morts et virages | Dépasser et croiser un camion |

## 5. Hors MVP

Animations, vidéo, audio, quiz dans la fiche, « activité terminée » séparée, regroupement des 10 thèmes en catégories, photos (arrivent avec le relais ; le bloc `image` est prêt).
