# 64 — Fiches t04 f02 et f03 (10 brouillons)

Date : 2026-10-25. Statut : **brouillon, à relire par le moniteur**. Format : doc 62. Aucun chiffre, `legal_status: "pending"` (aucun article trouvé).
À intégrer **après la session 18** : ajouter chaque fiche dans le tableau `sheets` du chapitre, après la fiche `f01` migrée. Titres de f01 : doc 62 §4. Aucune autre modification.

## À faire relire au moniteur en priorité

- c01-f03 : « Je ne suis pas prioritaire parce que le piéton traverse hors passage » (phrase de prudence, à confirmer).
- c02-f02 : remontée de file par les motos des deux côtés (usage observé, règle à sourcer).
- c03-f03 et c05-f02 : comportement des animaux et trajectoire d'un camion qui tourne.
- c05-f03 : « croiser en restant bien à droite » (à vérifier pour la route étroite).

## Contenu (JSON prêt à coller)

### t04-c01-f02 — Passage piéton et sortie d'école

```json
{
  "id": "t04-c01-f02",
  "title": "Passage piéton et sortie d'école",
  "blocks": [
    {
      "type": "text",
      "text": "Devant un passage piéton, je ne regarde pas seulement la bande blanche. Je regarde les gens autour : ceux qui attendent au bord, ceux qui courent pour traverser, ceux qui poussent une charrette ou portent un enfant."
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "list",
      "items": [
        "Je lève le pied dès que je vois le passage, pas au dernier moment.",
        "Si un piéton s'engage, je m'arrête et je lui laisse finir sa traversée.",
        "Je ne lui fais pas signe de passer devant moi si un autre véhicule peut arriver à côté."
      ]
    },
    {
      "type": "heading",
      "text": "Devant une école"
    },
    {
      "type": "text",
      "text": "À la sortie des classes, les enfants courent, se poussent et traversent sans regarder. Un car ou un taxi arrêté me cache la vue : je ne vois pas ce qui sort de derrière."
    },
    {
      "type": "attention",
      "text": "Un véhicule arrêté devant le passage cache les piétons. Je ralentis fort avant de le dépasser, même si la voie est libre."
    },
    {
      "type": "memo",
      "text": "Passage piéton ou école : je ralentis avant de voir le danger, pas après."
    }
  ]
}
```

### t04-c01-f03 — Piétons hors passage, la nuit

```json
{
  "id": "t04-c01-f03",
  "title": "Piétons hors passage, la nuit",
  "blocks": [
    {
      "type": "text",
      "text": "Au Sénégal, beaucoup de gens marchent au bord de la route, ou la traversent là où ils en ont besoin : devant un marché, un arrêt de car, une boutique. Hors passage, ils restent des personnes fragiles que je dois éviter."
    },
    {
      "type": "heading",
      "text": "Pourquoi c'est difficile la nuit"
    },
    {
      "type": "text",
      "text": "Le soir, un piéton vêtu de sombre se voit très tard dans les phares. Sur une route mal éclairée, je le découvre souvent quand il est déjà proche."
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "list",
      "items": [
        "Je ralentis dès que je vois un groupe de personnes au bord de la route.",
        "J'adapte ma vitesse à ce que mes phares me laissent voir.",
        "Je reste prêt à freiner ou à m'écarter, sans faire de mouvement brusque."
      ]
    },
    {
      "type": "attention",
      "text": "Je ne suis pas prioritaire parce que le piéton traverse hors passage : je dois toujours pouvoir m'arrêter."
    },
    {
      "type": "memo",
      "text": "Plus il fait sombre, plus je ralentis."
    }
  ]
}
```

### t04-c02-f02 — Remontée de file

```json
{
  "id": "t04-c02-f02",
  "title": "Remontée de file",
  "blocks": [
    {
      "type": "text",
      "text": "Dans un bouchon, les motos passent entre les files, à gauche comme à droite. C'est fréquent à Dakar, sur la VDN ou à Pikine, et un conducteur de voiture doit s'y attendre."
    },
    {
      "type": "heading",
      "text": "Pourquoi c'est dangereux"
    },
    {
      "type": "text",
      "text": "Une moto qui remonte la file arrive vite et sans bruit pour moi. Elle apparaît d'un coup dans mon angle mort, au moment où je me décale."
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "list",
      "items": [
        "Je garde ma voiture bien dans ma file, sans mordre sur le côté.",
        "Je regarde mes rétroviseurs avant tout mouvement, puis par-dessus l'épaule.",
        "Je laisse un passage quand je le peux, au lieu de fermer la voie par colère."
      ]
    },
    {
      "type": "attention",
      "text": "Se décaler « pour voir devant » dans un bouchon est le geste qui provoque le plus d'accrochages avec les motos."
    },
    {
      "type": "memo",
      "text": "Bouchon : une moto peut arriver des deux côtés, je regarde avant de bouger."
    }
  ]
}
```

### t04-c02-f03 — Ouvrir sa portière, tourner

```json
{
  "id": "t04-c02-f03",
  "title": "Ouvrir sa portière, tourner",
  "blocks": [
    {
      "type": "text",
      "text": "Deux gestes très simples causent beaucoup d'accidents de moto : ouvrir une portière et tourner sans regarder."
    },
    {
      "type": "heading",
      "text": "La portière"
    },
    {
      "type": "text",
      "text": "Garé au bord de la route, j'ouvre ma portière côté circulation. Une moto qui passe juste à côté n'a pas le temps de l'éviter."
    },
    {
      "type": "list",
      "items": [
        "Je regarde dans le rétroviseur, puis par-dessus l'épaule.",
        "J'ouvre doucement, d'abord un peu, puis en grand quand la voie est libre."
      ]
    },
    {
      "type": "heading",
      "text": "Tourner"
    },
    {
      "type": "text",
      "text": "Avant de tourner à droite ou de changer de direction, je regarde le côté vers lequel je vais. Une moto peut être là, dans l'angle mort, même si je ne l'ai pas vue dans le rétroviseur."
    },
    {
      "type": "attention",
      "text": "Mettre le clignotant ne donne pas la priorité : il avertit, mais je dois quand même regarder."
    },
    {
      "type": "memo",
      "text": "Avant d'ouvrir ou de tourner : rétroviseur, puis épaule."
    }
  ]
}
```

### t04-c03-f02 — Dépasser une charrette

```json
{
  "id": "t04-c03-f02",
  "title": "Dépasser une charrette",
  "blocks": [
    {
      "type": "text",
      "text": "Une charrette roule lentement et se déplace parfois sans prévenir. Je ne la dépasse que si je vois bien devant, sur une longue distance, et que la route est libre."
    },
    {
      "type": "heading",
      "text": "Ce que je regarde avant"
    },
    {
      "type": "list",
      "items": [
        "Y a-t-il quelqu'un en face ou un virage devant ?",
        "La charrette est-elle seule sur sa file, ou y a-t-il un autre véhicule devant elle ?",
        "Le cheval ou l'âne est-il calme ?"
      ]
    },
    {
      "type": "heading",
      "text": "Comment je dépasse"
    },
    {
      "type": "text",
      "text": "Je ralentis d'abord, je me place avec beaucoup d'espace sur le côté, je passe sans klaxonner fort, puis je me rabats seulement quand je la vois dans mon rétroviseur."
    },
    {
      "type": "attention",
      "text": "Un cheval surpris par un coup de klaxon peut se jeter d'un côté ou de l'autre. Je préfère ralentir et attendre."
    },
    {
      "type": "memo",
      "text": "Si je n'ai pas le temps de voir loin, je ne dépasse pas."
    }
  ]
}
```

### t04-c03-f03 — Troupeaux et animaux sur la route

```json
{
  "id": "t04-c03-f03",
  "title": "Troupeaux et animaux sur la route",
  "blocks": [
    {
      "type": "text",
      "text": "Dans beaucoup de régions, les troupeaux de moutons, de vaches ou de chèvres traversent la route, parfois tard dans la journée, parfois la nuit."
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "list",
      "items": [
        "Je ralentis dès que je vois des animaux ou un berger au bord de la route.",
        "Je m'arrête si le troupeau traverse, sans le presser.",
        "Je n'essaie pas de passer au milieu : un animal peut partir dans n'importe quelle direction."
      ]
    },
    {
      "type": "heading",
      "text": "La nuit"
    },
    {
      "type": "text",
      "text": "Un animal sombre est presque invisible. Sur une route de campagne, je règle ma vitesse pour pouvoir m'arrêter dans la partie de la route que mes phares éclairent."
    },
    {
      "type": "attention",
      "text": "Il y a souvent un animal derrière celui que je vois. Si un animal traverse, j'attends que le passage soit totalement libre."
    },
    {
      "type": "memo",
      "text": "Animaux sur la route : je ralentis, je laisse le temps, je ne force pas."
    }
  ]
}
```

### t04-c04-f02 — Arrêts brusques et passagers

```json
{
  "id": "t04-c04-f02",
  "title": "Arrêts brusques et passagers",
  "blocks": [
    {
      "type": "text",
      "text": "Les cars rapides, les Ndiaga Ndiaye, les bus et les taxis s'arrêtent là où un client leur fait signe. Ils freinent vite et se rabattent sans prévenir."
    },
    {
      "type": "heading",
      "text": "Ce qui se passe autour d'un arrêt"
    },
    {
      "type": "list",
      "items": [
        "Des passagers montent et descendent côté route.",
        "Des gens traversent devant et derrière le véhicule.",
        "Le véhicule redémarre vite et se remet sur la route."
      ]
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "text",
      "text": "Je garde de la distance derrière un véhicule de transport en commun. Quand il s'arrête, je ralentis fort avant de le dépasser : je regarde d'abord s'il y a des piétons devant lui."
    },
    {
      "type": "attention",
      "text": "Le car me cache les gens qui traversent. Je ne dépasse pas un car arrêté à toute vitesse."
    },
    {
      "type": "memo",
      "text": "Car arrêté : je ralentis, je regarde devant lui, puis je passe."
    }
  ]
}
```

### t04-c04-f03 — Taxis et bus : les gestes

```json
{
  "id": "t04-c04-f03",
  "title": "Taxis et bus : les gestes",
  "blocks": [
    {
      "type": "text",
      "text": "Un taxi ou un bus n'a pas toujours un comportement prévisible. Je lis son comportement avant de décider."
    },
    {
      "type": "heading",
      "text": "Les signes qui avertissent"
    },
    {
      "type": "list",
      "items": [
        "Il ralentit sans raison apparente : il cherche un client.",
        "Son clignotant est allumé : il va se rabattre ou se déporter.",
        "Il se déporte vers le bord de la route : il va s'arrêter."
      ]
    },
    {
      "type": "heading",
      "text": "Ce que je fais"
    },
    {
      "type": "list",
      "items": [
        "Je laisse de la place pour qu'il se rabatte.",
        "Je n'accélère pas pour le dépasser au moment où il signale.",
        "Quand j'utilise un taxi, je descends côté trottoir, pas côté route."
      ]
    },
    {
      "type": "attention",
      "text": "Un taxi qui ralentit peut s'arrêter d'un coup. Je ne reste pas collé à lui."
    },
    {
      "type": "memo",
      "text": "Un véhicule de transport qui ralentit va probablement s'arrêter."
    }
  ]
}
```

### t04-c05-f02 — Angles morts et virages

```json
{
  "id": "t04-c05-f02",
  "title": "Angles morts et virages",
  "blocks": [
    {
      "type": "text",
      "text": "Un camion est long, haut, et son conducteur ne voit pas tout. Autour de lui, il existe des zones où je suis invisible pour lui, même si je le vois très bien."
    },
    {
      "type": "heading",
      "text": "Où je ne suis pas vu"
    },
    {
      "type": "list",
      "items": [
        "Juste devant son capot.",
        "Sur son côté droit, le long de la cabine.",
        "Juste derrière lui."
      ]
    },
    {
      "type": "heading",
      "text": "Quand il tourne"
    },
    {
      "type": "text",
      "text": "Pour tourner à droite, le camion se déporte d'abord à gauche, puis son arrière balaie le côté droit. Un véhicule glissé à sa droite se fait coincer."
    },
    {
      "type": "attention",
      "text": "Se glisser à droite d'un camion qui tourne est l'erreur la plus grave. Je reste derrière, loin."
    },
    {
      "type": "memo",
      "text": "Si je ne vois pas ses rétroviseurs, il ne me voit pas."
    }
  ]
}
```

### t04-c05-f03 — Dépasser et croiser un camion

```json
{
  "id": "t04-c05-f03",
  "title": "Dépasser et croiser un camion",
  "blocks": [
    {
      "type": "text",
      "text": "Un camion est long à dépasser et il bouge sur la route. Je ne le dépasse que si la route est libre devant, sur une bonne distance, et que je peux revenir sur ma file sans le gêner."
    },
    {
      "type": "heading",
      "text": "Pour dépasser"
    },
    {
      "type": "list",
      "items": [
        "Je vérifie qu'aucun autre véhicule ne vient en face.",
        "Je laisse de l'espace en le dépassant, car il peut se déporter.",
        "Je ne me rabats que lorsque je vois bien tout le camion dans mon rétroviseur."
      ]
    },
    {
      "type": "heading",
      "text": "Pour croiser"
    },
    {
      "type": "text",
      "text": "Un camion qui arrive en face fait un appel d'air et prend beaucoup de place. Je me tiens bien à droite de ma voie, sans mordre sur le bas-côté."
    },
    {
      "type": "attention",
      "text": "Sur une route étroite, je ralentis avant le croisement, au lieu de freiner pendant."
    },
    {
      "type": "memo",
      "text": "Camion : je dépasse seulement si je vois loin, je croise en restant bien à droite."
    }
  ]
}
```
