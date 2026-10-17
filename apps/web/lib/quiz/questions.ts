import data from '../../content/questions.json'
import type { Question } from './types'

const QUESTIONS = data as Question[]

export function getQuestions(theme?: string): Question[] {
  return theme ? QUESTIONS.filter((q) => q.theme === theme) : QUESTIONS
}

/** Thèmes présents dans le JSON, dans l'ordre d'apparition, avec leur nombre de questions. */
export function getThemes(): { theme: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const q of QUESTIONS) counts.set(q.theme, (counts.get(q.theme) ?? 0) + 1)
  return Array.from(counts, ([theme, count]) => ({ theme, count }))
}
