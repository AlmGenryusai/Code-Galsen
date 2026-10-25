# 44 — Guide de rédaction des questions

Date : 2026-10-24. Pour toute personne (ou Claude) qui écrit des questions et des fiches. Format technique : 43. Thèmes : 42.

## 1. L'esprit

Une question Code Galsen ressemble à **un moment réel de conduite au Sénégal**. L'élève doit se dire : « ça m'est déjà arrivé ». On teste un réflexe ou une règle, pas la lecture d'un piège.

## 2. Ton

- Questions à la **première personne** : « Je peux… », « Je dois… », « Dans cette situation, je… ». Comme si l'élève était au volant.
- Explications au **vous**, simples, bienveillantes : « Vous devez céder le passage parce que… ».
- Phrases courtes. Un mot simple plutôt qu'un mot technique, sauf si le mot technique est à l'examen (dans ce cas, l'expliquer une fois).
- Jamais moqueur, jamais culpabilisant.

## 3. Longueurs

| Élément | Maximum |
|---|---|
| Question (`text`) | 120 caractères |
| Réponse (option) | 60 caractères |
| Explication | 3 phrases, 300 caractères |
| Erreur fréquente | 1 phrase |

Lisible en un coup d'œil sur un petit écran.

## 4. Les situations du pays

À utiliser partout où c'est naturel :
- Motos et **Jakarta** qui remontent les files, des deux côtés.
- **Charrettes** (cheval, âne), animaux en divagation (chèvres, moutons, bœufs).
- **Cars rapides**, **Ndiaga Ndiaye**, bus Dakar Dem Dikk, taxis, **clandos** qui s'arrêtent n'importe où.
- Piétons sur la chaussée faute de trottoir, marchands, sorties d'écoles et de mosquées.
- Ronds-points chargés, agents qui règlent la circulation, feux en panne.
- Pluies d'hivernage, sable sur la route, harmattan, chaleur.
- Autoroute à péage, routes nationales, pistes.

Lieux réels possibles s'ils sont connus de tous (VDN, autoroute à péage), sans désigner une personne ou une entreprise.

## 5. Bonnes réponses et distracteurs

- Chaque mauvaise réponse doit être **une erreur qu'un vrai élève pourrait faire**. Aucune réponse absurde.
  - ❌ « Celui qui klaxonne » (personne ne le croit vraiment).
  - ✅ « Celui qui est déjà engagé dans le carrefour » (croyance fréquente).
- Pas de « toutes les réponses » ni « aucune réponse ».
- Pas de double négation, pas de « ne… pas » piège dans la question.
- Les réponses ont des longueurs proches (la bonne ne doit pas être la plus longue).
- Plusieurs bonnes réponses : seulement si c'est naturel (une liste de gestes, d'équipements). Le dire n'est pas nécessaire, l'app affiche « Plusieurs réponses ».
- OUI/NON : réservé aux situations où la réponse ne se devine pas sans regarder la photo.

## 6. Explication et erreur fréquente

- L'explication dit **pourquoi** (la cause, le danger), pas seulement la règle.
  - ❌ « Il faut céder le passage à droite. »
  - ✅ « Sans panneau ni feu, la priorité est à droite. Le véhicule de droite ne s'attend pas à ce que vous passiez. »
- `common_mistake` : l'erreur qu'on voit le plus chez les élèves, en une phrase.

## 7. Chiffres et règles : la règle absolue

- **Aucun chiffre légal sans source** (vitesse, taux d'alcool, amende, points, distance, âge).
- Règle tirée d'un texte → `legal_ref` (« Décret 2004-13 art. 28 ») et `legal_status: "confirmed"` seulement si l'article a été lu (fiche 27).
- Chiffre non confirmé → `legal_status: "pending"` : la question reste `draft`, elle ne sera pas publiée.
- Conseil de bon sens sans texte (regarder l'angle mort) → `legal_status: "not_regulatory"`, `legal_ref: null`.
- En cas de doute : on n'écrit pas le chiffre, on fait une question de comportement.

## 8. Ce qu'on ne fait jamais

- Copier ou paraphraser de près une question d'Ornikar ou d'une autre appli.
- Inventer un panneau, un marquage ou une règle qui n'existe pas au Sénégal.
- Écrire « question de l'examen officiel » ou « conforme à l'examen ».
- Photo générée par IA pour un panneau.

## 9. Avec ou sans photo

- **Par défaut, avec photo** : la question part de ce qu'on voit.
- Le repère (`marker`) pointe ce que l'élève doit regarder quand la photo est chargée.
- Sans photo : questions de connaissance pure (documents, mécanique, premiers secours). Objectif : au moins 1 question sur 2 avec photo.
- Si la photo n'existe pas encore : écrire la question avec une **description de la photo souhaitée** dans `media.alt` et ajouter la prise au brief photo (45).

## 10. Checklist avant de soumettre un lot

- [ ] Thème et chapitre corrects (42).
- [ ] Situation réaliste au Sénégal.
- [ ] Aucun distracteur absurde.
- [ ] Explication avec un « pourquoi ».
- [ ] Chiffres : sourcés ou `pending`.
- [ ] Longueurs respectées.
- [ ] Photo présente, ou décrite et ajoutée au brief photo.
- [ ] Relu à voix haute : ça sonne humain.

Lots de 50 questions pour le moniteur, par chapitre.
