// Format des questions v2 — spec : docs/refonte/43_format_question_v2.md
// Source : content/questions/<chapitre>.json
// Règles contenu : CLAUDE.md §Contenu (aucun chiffre légal sans source)

export type OptionId = 'A' | 'B' | 'C' | 'D'

export interface Part {
  text: string
  options: { id: OptionId; text: string }[] // 2 à 4
  correct: OptionId[] // au moins 1
  shuffle?: boolean // défaut true ; false pour OUI/NON et listes ordonnées
}

export interface Media {
  kind: 'photo' | 'sign'
  src: string // photo : chemin dans content/media/ ; sign : id d'un panneau de components/sign/signs.tsx
  alt: string
  credit: string
  marker?: { x: number; y: number } // % de l'image, 0-100
  badge?: 'moto' | 'pieton' | 'charrette' | 'bus' | 'camion' | 'animal'
}

export interface QuestionV2 {
  id: string // "t04-c02-0007" : chapitre + numéro, jamais réutilisé
  theme: string // "t04"
  chapter: string // "t04-c02"
  media?: Media
  parts: [Part] | [Part, Part]
  explanation: string
  common_mistake?: string
  legal_ref: string | null // article de loi ou décret ; null = non sourcé
  legal_status: 'confirmed' | 'pending' | 'not_regulatory'
  status: 'draft' | 'reviewed' | 'published'
  review?: { moniteur?: string; juriste?: string } // dates ISO
}
