// Fiches de cours en blocs — spec : docs/refonte/62_nouveau_format_fiches.md
// Source : content/lessons/<chapitre>.json. Le titre du chapitre vient de TAXONOMY, jamais du JSON.
import type { Media, QuestionV2 } from '../quiz/types'

export type Block =
  | { type: 'text'; text: string } // paragraphe, **gras** autorisé
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'attention'; text: string } // encadré « ATTENTION »
  | { type: 'memo'; text: string } // encadré « AIDE-MÉMOIRE »
  | { type: 'table'; head: [string, string]; rows: { label: string; text: string; media?: Media }[] }
  | { type: 'image'; media: Media; caption?: string }
  | { type: 'signs'; items: { media: Media; label: string }[] } // grille de panneaux, nom dessous, **gras** autorisé

export interface Sheet {
  id: string // "t04-c01-f01", jamais réutilisé
  title: string
  blocks: Block[]
}

export interface LessonFile {
  id: string // = id du chapitre, ex. "t04-c01"
  theme: string // "t04"
  sheets: Sheet[] // 1 à 5
  legal_ref: string | null
  legal_status: 'sourced' | 'pending' | 'none'
  status: 'draft' | 'reviewed' | 'published'
  review?: QuestionV2['review']
}
