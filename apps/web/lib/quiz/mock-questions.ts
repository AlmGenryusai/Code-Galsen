// DONNÉES MOCK — remplacées par le contenu JSON validé (apps/web/content)
// Règles contenu : CLAUDE.md §Contenu (aucun chiffre légal sans source)

export interface Question {
  id: string
  text: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  themeId: string
  needs_review?: boolean // chiffre non sourcé : à faire valider par un moniteur
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q3',
    themeId: 'priorites',
    text: 'À un carrefour sans signalisation, qui est prioritaire ?',
    options: [
      { id: 'a', text: 'Celui qui vient de gauche' },
      { id: 'b', text: 'Celui qui vient de droite' },
      { id: 'c', text: 'Celui qui roule le plus vite' },
      { id: 'd', text: 'Celui qui klaxonne' },
    ],
    correctId: 'b',
    explanation: 'Règle de priorité à droite : le véhicule venant de droite est prioritaire à tout carrefour sans signalisation.',
  },
  {
    id: 'q4',
    themeId: 'signalisation',
    text: 'Un panneau circulaire à fond rouge signifie :',
    options: [
      { id: 'a', text: 'Une obligation' },
      { id: 'b', text: 'Un danger' },
      { id: 'c', text: 'Une interdiction' },
      { id: 'd', text: 'Une indication' },
    ],
    correctId: 'c',
    explanation: 'Les panneaux circulaires à fond rouge sont des panneaux d\'interdiction.',
  },
  {
    id: 'q6',
    themeId: 'feux',
    text: 'Que signifie un feu orange fixe ?',
    options: [
      { id: 'a', text: 'Accélérer pour passer avant le rouge' },
      { id: 'b', text: 'Freiner si possible, sinon franchir prudemment' },
      { id: 'c', text: 'Même signification qu\'un feu rouge' },
      { id: 'd', text: 'Priorité aux piétons uniquement' },
    ],
    correctId: 'b',
    explanation: 'Le feu orange annonce le passage au rouge. Freinez si vous le pouvez en toute sécurité ; sinon, franchissez prudemment l\'intersection.',
  },
  {
    id: 'q7',
    themeId: 'distances',
    text: 'Quelle est la distance de sécurité minimale recommandée derrière le véhicule qui vous précède ?',
    options: [
      { id: 'a', text: '1 seconde de distance' },
      { id: 'b', text: '2 secondes de distance' },
      { id: 'c', text: '10 mètres fixes' },
      { id: 'd', text: 'La longueur de votre véhicule' },
    ],
    correctId: 'b',
    explanation: 'La règle des 2 secondes : votre véhicule doit passer un repère fixe au moins 2 secondes après le véhicule qui vous précède.',
    needs_review: true,
  },
  {
    id: 'q8',
    themeId: 'priorites',
    text: 'Sur une route signalée comme prioritaire, qui a la priorité à une intersection ?',
    options: [
      { id: 'a', text: 'Le véhicule arrivant de droite' },
      { id: 'b', text: 'Le véhicule sur la route prioritaire' },
      { id: 'c', text: 'Le premier arrivé' },
      { id: 'd', text: 'Le véhicule le plus lourd' },
    ],
    correctId: 'b',
    explanation: 'Sur une route prioritaire, les véhicules qui y circulent ont la priorité sur tous ceux venant des voies secondaires.',
  },
  {
    id: 'q9',
    themeId: 'signalisation',
    text: 'Un triangle inversé (pointe en bas) à fond blanc avec liséré rouge signifie :',
    options: [
      { id: 'a', text: 'Arrêt obligatoire' },
      { id: 'b', text: 'Cédez le passage' },
      { id: 'c', text: 'Sens interdit' },
      { id: 'd', text: 'Zone de danger' },
    ],
    correctId: 'b',
    explanation: 'Le panneau "Cédez le passage" impose de laisser passer les usagers venant de la route croisée, sans arrêt obligatoire.',
  },
  {
    id: 'q10',
    themeId: 'comportement',
    text: 'L\'utilisation du téléphone tenu en main au volant est-elle autorisée au Sénégal ?',
    options: [
      { id: 'a', text: 'Oui, à vitesse réduite' },
      { id: 'b', text: 'Oui, à l\'arrêt' },
      { id: 'c', text: 'Non, c\'est interdit et sanctionné' },
      { id: 'd', text: 'Oui, avec oreillette Bluetooth' },
    ],
    correctId: 'c',
    explanation: 'Tenir son téléphone en main au volant est strictement interdit et passible d\'une amende, même à l\'arrêt.',
  },
  {
    id: 'q12',
    themeId: 'comportement',
    text: 'Un piéton s\'engage sur un passage piéton. Que faire ?',
    options: [
      { id: 'a', text: 'Klaxonner pour l\'avertir' },
      { id: 'b', text: 'Accélérer pour passer avant lui' },
      { id: 'c', text: 'Ralentir et lui céder le passage' },
      { id: 'd', text: 'Continuer si la voie de droite est libre' },
    ],
    correctId: 'c',
    explanation: 'Le piéton engagé sur un passage piéton est prioritaire. Vous devez impérativement ralentir et lui céder le passage.',
  },
  {
    id: 'q13',
    themeId: 'feux',
    text: 'Un feu rouge clignotant à une intersection signifie :',
    options: [
      { id: 'a', text: 'Ralentir et passer prudemment' },
      { id: 'b', text: 'S\'arrêter obligatoirement et céder le passage avant de repartir' },
      { id: 'c', text: 'Priorité aux véhicules venant de gauche' },
      { id: 'd', text: 'Même signification qu\'un feu orange fixe' },
    ],
    correctId: 'b',
    explanation: 'Le feu rouge clignotant signifie arrêt obligatoire, puis cédez le passage. Il indique une intersection à risque élevé.',
  },
  {
    id: 'q15',
    themeId: 'signalisation',
    text: 'Le dépassement est interdit :',
    options: [
      { id: 'a', text: 'Sur toute route en dehors des agglomérations' },
      { id: 'b', text: 'Lorsqu\'une ligne continue sépare les voies' },
      { id: 'c', text: 'De nuit uniquement' },
      { id: 'd', text: 'Uniquement sur les routes nationales' },
    ],
    correctId: 'b',
    explanation: 'La ligne continue au centre de la chaussée interdit formellement tout dépassement. Seule la ligne discontinue autorise le franchissement.',
  },
]
