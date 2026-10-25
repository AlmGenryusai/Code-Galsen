# 47 — Fiches de cours : modèle

Date : 2026-10-25. Statut : **validé par Alfred le 2026-10-25** (durée max portée à 280 s), implémenté en session 17.
Base : 40 (Ornikar : partie « cours »), 42 (taxonomie), 43 (statuts), 44 (ton), 46 (charte).

## 1. Principe

- **1 fiche = 1 chapitre** de la taxonomie 42 (28 fiches à terme).
- Lecture en **280 secondes maximum** sur téléphone : 900 mots au plus, 4 blocs fixes. Plus court si le chapitre le permet.
- Même règles que les questions : aucun chiffre sans `legal_ref`, statuts `draft` / `reviewed` / `published`, relecture moniteur, juriste pour le réglementaire.
- En bas de la fiche, un seul bouton orange : « M'entraîner sur ce thème » (série du thème).

## 2. Les 4 blocs

| Bloc | Titre affiché | Contenu |
|---|---|---|
| `rule` | La règle | 2-3 phrases, ce qu'il faut faire. |
| `why` | Pourquoi | 1-2 phrases, la cause (sécurité, visibilité, freinage). |
| `situation` | Sur la route | Une scène au Sénégal : VDN, rond-point, marché, sortie d'école, hivernage. |
| `trap` | Le piège | L'erreur fréquente des élèves, ton de moniteur. |

## 3. Schéma

```ts
interface Lesson {
  id: string             // = id du chapitre, ex. "t04-c01"
  theme: string          // "t04"
  blocks: { rule: string; why: string; situation: string; trap: string }
  media?: QuestionV2['media']   // facultatif, même format que les questions
  legal_ref: string | null
  legal_status: 'sourced' | 'pending' | 'none'
  status: 'draft' | 'reviewed' | 'published'
  review?: QuestionV2['review']
}
```

Le titre vient de la taxonomie (`TAXONOMY`), jamais du JSON. Fichiers : `apps/web/content/lessons/<chapitre>.json`.

## 4. Brouillons t04 (thème gratuit)

Rédigés par Claude, **à relire par le moniteur**. Aucun chiffre. Article de loi à trouver → `legal_status: "pending"`.

### t04-c01 Piétons
- **La règle** : je cède le passage au piéton qui traverse ou s'engage sur un passage piéton. Hors passage, je ralentis et je reste prêt à m'arrêter.
- **Pourquoi** : un piéton n'a aucune protection. À faible vitesse, je m'arrête à temps ; plus vite, le choc peut être mortel.
- **Sur la route** : sortie d'école à Grand-Yoff, des enfants traversent entre deux cars rapides arrêtés. Je ne vois pas derrière les cars : je ralentis avant d'arriver à leur hauteur.
- **Le piège** : croire qu'un piéton hors passage n'a pas la priorité et garder sa vitesse. On doit toujours éviter de le heurter.

### t04-c02 Motos et Jakarta
- **La règle** : avant de tourner, de changer de file ou d'ouvrir ma portière, je regarde dans mes rétroviseurs puis par-dessus l'épaule. Je laisse de l'espace sur les côtés.
- **Pourquoi** : une moto est petite, rapide et souvent dans l'angle mort.
- **Sur la route** : bouchon sur la VDN, les Jakarta remontent entre les files et par la droite. Avant de me décaler, je tourne la tête.
- **Le piège** : se fier au seul rétroviseur. La moto qui arrive est souvent juste à côté, dans l'angle mort.

### t04-c03 Charrettes et animaux
- **La règle** : je ralentis à l'approche d'une charrette ou d'un troupeau. Je ne dépasse que si je vois assez loin devant et en laissant beaucoup d'espace.
- **Pourquoi** : un cheval ou un animal peut s'écarter brusquement, et une charrette n'a souvent ni feux ni rétroviseurs.
- **Sur la route** : à la sortie de Thiès, une charrette chargée roule sur le bord de la route. Le soir, je la vois tard : je ralentis dès que je la devine.
- **Le piège** : klaxonner fort en dépassant. L'animal peut prendre peur et se jeter sur la route.

### t04-c04 Transports en commun
- **La règle** : je me méfie des cars rapides, Ndiaga Ndiaye, bus et taxis qui s'arrêtent n'importe où pour prendre des clients. Je garde de la distance derrière eux.
- **Pourquoi** : un arrêt brusque devant moi, et des passagers qui descendent côté route.
- **Sur la route** : un Ndiaga Ndiaye freine d'un coup au bord de la route à Pikine. Des passagers descendent et traversent devant lui : je ralentis et je ne le dépasse pas sans voir.
- **Le piège** : dépasser un car arrêté sans ralentir. Un piéton peut surgir devant le car.

### t04-c05 Poids lourds
- **La règle** : je reste visible pour le chauffeur du camion. Je ne me place pas juste à côté de lui ni juste derrière, et je ne le dépasse que si j'ai la place.
- **Pourquoi** : un camion a de grands angles morts et met longtemps à freiner. En tournant, son arrière déborde.
- **Sur la route** : au port de Dakar, un camion tourne à droite. Je reste derrière lui, loin, au lieu de passer à sa droite.
- **Le piège** : se glisser à droite d'un camion qui tourne. Le chauffeur ne me voit pas.

## 5. Points de décision

1. Fiche lue = cochée « Lue » dans la progression. Pas de quiz dans la fiche : le bouton envoie vers la série du thème.
2. Gratuit : les fiches du thème gratuit t04. Les autres sont verrouillées, comme les séries.
3. Les autres thèmes : fiches écrites par Claude par lots, après relecture des fiches t04.