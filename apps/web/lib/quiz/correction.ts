// Correction tout ou rien — doc 43 §3
import type { OptionId, Part, QuestionV2 } from './types'

/**
 * Juste seulement si chaque partie a exactement l'ensemble des bonnes réponses.
 * `answers[i]` = cases cochées de la partie i (ordre indifférent).
 */
export function isCorrect(question: QuestionV2, answers: OptionId[][]): boolean {
  if (answers.length !== question.parts.length) return false
  return question.parts.every((part, i) => {
    const given = new Set(answers[i])
    return given.size === part.correct.length && part.correct.every((id) => given.has(id))
  })
}

/** Type affiché dans la barre du bas. On coche puis on valide dans tous les cas. */
export function answerKind(question: QuestionV2): 'single' | 'multi' | 'double' {
  if (question.parts.length > 1) return 'double'
  return question.parts[0].correct.length > 1 ? 'multi' : 'single'
}

/** Nouvelle sélection d'une partie après un tap : bascule si plusieurs bonnes réponses, sinon remplace. */
export function togglePick(part: Part, current: OptionId[], id: OptionId): OptionId[] {
  if (part.correct.length === 1) return [id]
  return current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
}
