// DONNÉES MOCK — remplacées par Dexie + dataset réel en S1.14/S1.15
// Source règles : CLAUDE.md §Règles métier critiques

export interface Question {
  id: string
  text: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  themeId: string
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    themeId: 'vitesse',
    text: 'Quelle est la vitesse maximale autorisée en agglomération au Sénégal ?',
    options: [
      { id: 'a', text: '40 km/h' },
      { id: 'b', text: '50 km/h' },
      { id: 'c', text: '60 km/h' },
      { id: 'd', text: '80 km/h' },
    ],
    correctId: 'a',
    explanation: 'En agglomération au Sénégal/UEMOA : 40 km/h. La limite de 50 km/h est propre au Code français.',
  },
  {
    id: 'q2',
    themeId: 'vitesse',
    text: 'Sur route nationale hors agglomération, quelle vitesse maximale est autorisée ?',
    options: [
      { id: 'a', text: '80 km/h' },
      { id: 'b', text: '90 km/h' },
      { id: 'c', text: '100 km/h' },
      { id: 'd', text: '110 km/h' },
    ],
    correctId: 'c',
    explanation: 'Hors agglomération sur route nationale : 100 km/h selon le Code UEMOA.',
  },
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
    id: 'q5',
    themeId: 'alcool',
    text: 'Le taux d\'alcoolémie maximal autorisé au volant au Sénégal est de :',
    options: [
      { id: 'a', text: '0,5 g/L' },
      { id: 'b', text: '0,8 g/L' },
      { id: 'c', text: '0,0 g/L (tolérance zéro)' },
      { id: 'd', text: '1,0 g/L' },
    ],
    correctId: 'a',
    explanation: 'Le seuil légal au Sénégal est de 0,5 g/L de sang, comme dans la majorité des pays UEMOA.',
  },
]
