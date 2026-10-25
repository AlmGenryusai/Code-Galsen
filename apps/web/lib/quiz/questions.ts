import t01c01 from '../../content/questions/t01-c01.json'
import t01c02 from '../../content/questions/t01-c02.json'
import t01c03 from '../../content/questions/t01-c03.json'
import t01c04 from '../../content/questions/t01-c04.json'
import t01c05 from '../../content/questions/t01-c05.json'
import t01c06 from '../../content/questions/t01-c06.json'
import t02c01 from '../../content/questions/t02-c01.json'
import t02c02 from '../../content/questions/t02-c02.json'
import t03c01 from '../../content/questions/t03-c01.json'
import t03c02 from '../../content/questions/t03-c02.json'
import t03c03 from '../../content/questions/t03-c03.json'
import t04c01 from '../../content/questions/t04-c01.json'
import t04c02 from '../../content/questions/t04-c02.json'
import t04c03 from '../../content/questions/t04-c03.json'
import t04c04 from '../../content/questions/t04-c04.json'
import t04c05 from '../../content/questions/t04-c05.json'
import t05c01 from '../../content/questions/t05-c01.json'
import t05c02 from '../../content/questions/t05-c02.json'
import t05c03 from '../../content/questions/t05-c03.json'
import t05c04 from '../../content/questions/t05-c04.json'
import { TAXONOMY } from './taxonomy'
import type { QuestionV2 } from './types'

// Un import par chapitre (le test de publication vérifie qu'aucun fichier n'est oublié).
const ALL = [t01c01, t01c02, t01c03, t01c04, t01c05, t01c06, t02c01, t02c02, t03c01, t03c02, t03c03, t04c01, t04c02, t04c03, t04c04, t04c05, t05c01, t05c02, t05c03, t05c04].flat() as QuestionV2[]

// Doc 43 §4 : l'app n'affiche que les `published`. Tant qu'aucune question n'est relue,
// on montre aussi les brouillons ; passer à false au lancement.
export const SHOW_DRAFTS = true

export function getQuestions(theme?: string): QuestionV2[] {
  const visible = ALL.filter((q) => SHOW_DRAFTS || q.status === 'published')
  return theme ? visible.filter((q) => q.theme === theme) : visible
}

/** Thèmes ayant des questions, dans l'ordre de la taxonomie, avec leur nombre de questions. */
export function getThemes(): { theme: string; count: number }[] {
  const questions = getQuestions()
  return TAXONOMY.map((t) => ({ theme: t.id, count: questions.filter((q) => q.theme === t.id).length })).filter(
    (t) => t.count > 0,
  )
}
