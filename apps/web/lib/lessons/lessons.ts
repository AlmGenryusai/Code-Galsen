import t04c01 from '../../content/lessons/t04-c01.json'
import t04c02 from '../../content/lessons/t04-c02.json'
import t04c03 from '../../content/lessons/t04-c03.json'
import t04c04 from '../../content/lessons/t04-c04.json'
import t04c05 from '../../content/lessons/t04-c05.json'
import { SHOW_DRAFTS } from '../quiz/questions'
import type { Lesson } from './types'

// Un import par chapitre (le test de publication vérifie qu'aucun fichier n'est oublié).
const ALL = [t04c01, t04c02, t04c03, t04c04, t04c05] as Lesson[]

/** Blocs dans l'ordre d'affichage, avec leur titre. */
export const LESSON_BLOCKS = [
  { key: 'rule', title: 'La règle' },
  { key: 'why', title: 'Pourquoi' },
  { key: 'situation', title: 'Sur la route' },
  { key: 'trap', title: 'Le piège' },
] as const

// Même interrupteur que les questions (doc 43 §4)
export function getLessons(): Lesson[] {
  return ALL.filter((l) => SHOW_DRAFTS || l.status === 'published')
}

export function getLesson(chapterId: string | null): Lesson | undefined {
  return getLessons().find((l) => l.id === chapterId)
}

export function lessonHref(chapterId: string): string {
  return `/fiches?c=${encodeURIComponent(chapterId)}`
}
