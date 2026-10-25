// Fiche de cours — spec : docs/refonte/47_modele_fiche_cours.md
// Source : content/lessons/<chapitre>.json. Le titre vient de TAXONOMY, jamais du JSON.
import type { Media, QuestionV2 } from '../quiz/types'

export interface Lesson {
  id: string // = id du chapitre, ex. "t04-c01"
  theme: string // "t04"
  blocks: { rule: string; why: string; situation: string; trap: string }
  media?: Media // facultatif, même format que les questions
  legal_ref: string | null
  legal_status: 'sourced' | 'pending' | 'none'
  status: 'draft' | 'reviewed' | 'published'
  review?: QuestionV2['review']
}
