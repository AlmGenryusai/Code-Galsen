# 42 — Taxonomie Code Galsen : thèmes et chapitres

Date : 2026-10-24. Statut : **proposition, à valider par Alfred** (puis par le moniteur pour les intitulés).
Base : grille Ornikar (40 §9), formulée avec nos mots et adaptée au Sénégal. Ce n'est **pas** un format officiel sénégalais (R3 en attente).

## Règles

- Chaque question appartient à **1 thème** et **1 chapitre**.
- Ids stables, jamais renommés : `t01` … `t10`, chapitres `t01-c01` …
- Les intitulés peuvent changer, les ids non.
- « Volume lancement » = cible de questions `published` au lancement (total 200). « Priorité » : ordre de production.

## Carte

| Id | Thème | Chapitres | Volume lancement | Priorité |
|---|---|---|---|---|
| t01 | Circuler et respecter la signalisation | c01 Panneaux et marquages · c02 Intersections et priorités · c03 Place sur la chaussée · c04 Vitesse · c05 Croiser et dépasser · c06 Arrêt et stationnement | 55 (c01 20, c02 12, c03 6, c04 5, c05 6, c06 6) | 🔴 1 |
| t02 | Le conducteur | c01 Regarder, anticiper, communiquer · c02 Être en état de conduire (fatigue, chaleur, alcool, médicaments, téléphone) | 20 | 🟠 3 |
| t03 | La route et ses dangers | c01 Conditions difficiles (nuit, pluie d'hivernage, poussière, harmattan) · c02 Autoroute à péage · c03 Zones à risque (marchés, écoles, passages à niveau, routes non bitumées) | 20 | 🟠 3 |
| t04 | Les autres usagers | c01 Piétons · c02 Motos et Jakarta · c03 Charrettes et animaux · c04 Transports en commun (cars rapides, Ndiaga Ndiaye, bus, taxis) · c05 Poids lourds | 30 | 🔴 1 |
| t05 | Règles et papiers | c01 Documents (permis, carte grise, assurance, visite technique) · c02 Chargement et passagers · c03 Permis à points · c04 Infractions et sanctions | 15 | 🟡 4 (dépend R1, R2) |
| t06 | Porter secours | c01 Protéger, alerter, secourir | 10 | 🟠 3 |
| t07 | Monter, s'installer, descendre | c01 S'installer au poste de conduite · c02 Entrer et sortir du véhicule | 10 | 🟠 2 |
| t08 | Le véhicule | c01 Fonctionnement et voyants · c02 Entretien, chaleur et pannes | 15 | 🟠 2 |
| t09 | Sécurité des passagers | c01 Ceinture et aides à la conduite · c02 Passagers et enfants | 15 | 🟠 2 |
| t10 | Conduite économe | c01 Consommer moins, polluer moins | 10 | 🟡 5 |

Total : 200.

## Points de décision

1. **Thème gratuit** : je propose **t04 Les autres usagers**. C'est le plus « sénégalais », il montre tout de suite la différence avec une appli générique, et il ne dépend d'aucun chiffre légal non confirmé.
2. **t05** dépend des textes (R1, R2). On le produit en dernier ; ses questions chiffrées restent `draft`.
3. **t01-c04 Vitesse** : 5 questions seulement, sans chiffre tant que les vitesses ne sont pas confirmées (questions de comportement : adapter sa vitesse, distance d'arrêt).
4. Examen blanc : répartition par thème **proportionnelle au volume** par défaut (`EXAM_CONFIG`), à corriger quand le format officiel sera connu (R3).

## Correspondance avec les 14 questions actuelles

| Thème actuel (`theme`) | Nouveau |
|---|---|
| Priorités et intersections | t01-c02 |
| Signalisation | t01-c01 |
| Signalisation de danger | t01-c01 |
| Feux et signaux | t01-c01 |
| Distances de sécurité | t01-c03 |
| Comportement du conducteur | t02-c01 ou t02-c02 (au cas par cas) |
| Partage de la chaussée | t04 (chapitre selon l'usager) |

Les doublons « Signalisation » / « Signalisation de danger » disparaissent.
