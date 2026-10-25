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

/** Plusieurs bonnes réponses ou question double : on coche puis on valide (sinon un tap suffit). */
export function needsValidation(question: QuestionV2): boolean {
  return question.parts.length > 1 || question.parts[0].correct.length > 1
}

/** Nouvelle sélection d'une partie après un tap : bascule si plusieurs bonnes réponses, sinon remplace. */
export function togglePick(part: Part, current: OptionId[], id: OptionId): OptionId[] {
  if (part.correct.length === 1) return [id]
  return current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
}
