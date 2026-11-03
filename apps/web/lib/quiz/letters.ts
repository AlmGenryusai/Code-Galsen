// Lettres A-D telles qu'elles apparaissent à l'écran.
// `id` = identifiant stocké / sélectionné ; `letter` = pastille affichée (position dans l'ordre affiché).
import type { OptionId, Part, QuestionV2 } from './types'

const LETTERS: OptionId[] = ['A', 'B', 'C', 'D']

export interface Slot {
  id: OptionId
  letter: OptionId
  label: string
}

export function partText(part: Part): string {
  return part.kind === 'yesno' ? part.statement : part.text
}

/**
 * Cases de chaque partie, dans l'ordre affiché. Les lettres se suivent d'une partie à l'autre
 * (OUI/NON = A/B puis C/D). `orders[i]` = ids de la partie i dans l'ordre affiché (mélange) ;
 * par défaut l'ordre du JSON. Les OUI/NON ne sont jamais mélangés.
 */
export function partSlots(q: QuestionV2, orders: OptionId[][] = []): Slot[][] {
  let offset = 0
  return q.parts.map((part, pi) => {
    let entries: { id: OptionId; label: string }[]
    if (part.kind === 'yesno') {
      entries = [
        { id: LETTERS[offset], label: 'OUI' },
        { id: LETTERS[offset + 1], label: 'NON' },
      ]
    } else {
      const order = orders[pi]
      const opts = order
        ? order.flatMap((id) => part.options.filter((o) => o.id === id))
        : part.options
      entries = opts.map((o) => ({ id: o.id, label: o.text }))
    }
    const slots = entries.map((e, i) => ({ ...e, letter: LETTERS[offset + i] ?? e.id }))
    offset += slots.length
    return slots
  })
}

/** Ids des bonnes réponses de chaque partie (indépendant de l'ordre affiché). */
export function correctIds(q: QuestionV2): OptionId[][] {
  const slots = partSlots(q)
  return q.parts.map((part, pi) =>
    part.kind === 'yesno' ? [slots[pi][part.correct === 'yes' ? 0 : 1].id] : part.correct,
  )
}

/** Lettres affichées des bonnes réponses, toutes parties confondues, triées. */
export function correctLetters(q: QuestionV2, orders: OptionId[][] = []): OptionId[] {
  const slots = partSlots(q, orders)
  const ids = correctIds(q)
  return slots
    .flatMap((part, pi) => part.filter((s) => ids[pi].includes(s.id)).map((s) => s.letter))
    .sort()
}

/** « D », « A et C », « A, B et C » */
export function formatLetters(letters: string[]): string {
  if (letters.length <= 1) return letters.join('')
  return `${letters.slice(0, -1).join(', ')} et ${letters[letters.length - 1]}`
}

export function correctLettersText(q: QuestionV2, orders: OptionId[][] = []): string {
  const letters = correctLetters(q, orders)
  return `${letters.length > 1 ? 'Bonnes réponses' : 'Bonne réponse'} : ${formatLetters(letters)}`
}
