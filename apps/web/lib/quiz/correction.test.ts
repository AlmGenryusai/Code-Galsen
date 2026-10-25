import { describe, it, expect } from 'vitest'
import { answerKind, isCorrect, togglePick } from './correction'
import type { Part, QuestionV2 } from './types'

function question(...parts: Part[]): QuestionV2 {
  return {
    id: 't00-c00-0001',
    theme: 't00',
    chapter: 't00-c00',
    parts: parts as QuestionV2['parts'],
    explanation: '',
    legal_ref: null,
    legal_status: 'not_regulatory',
    status: 'draft',
  }
}

const single: Part = {
  text: 'x',
  options: [
    { id: 'A', text: 'a' },
    { id: 'B', text: 'b' },
    { id: 'C', text: 'c' },
  ],
  correct: ['B'],
}
const multi: Part = { ...single, correct: ['A', 'B'] }
const yesNo: Part = {
  text: 'y',
  options: [
    { id: 'C', text: 'OUI' },
    { id: 'D', text: 'NON' },
  ],
  correct: ['D'],
  shuffle: false,
}

describe('isCorrect — une bonne réponse', () => {
  const q = question(single)
  it('bonne réponse → juste', () => expect(isCorrect(q, [['B']])).toBe(true))
  it('mauvaise réponse → faux', () => expect(isCorrect(q, [['A']])).toBe(false))
  it('rien coché → faux', () => expect(isCorrect(q, [[]])).toBe(false))
  it('bonne + une en trop → faux', () => expect(isCorrect(q, [['B', 'C']])).toBe(false))
})

describe('isCorrect — plusieurs bonnes réponses', () => {
  const q = question(multi)
  it('toutes cochées, ordre indifférent → juste', () => {
    expect(isCorrect(q, [['A', 'B']])).toBe(true)
    expect(isCorrect(q, [['B', 'A']])).toBe(true)
  })
  it('une seule des deux → faux (pas de demi-point)', () => expect(isCorrect(q, [['A']])).toBe(false))
  it('une case en trop → faux', () => expect(isCorrect(q, [['A', 'B', 'C']])).toBe(false))
  it('case doublonnée ne compte pas pour deux', () => expect(isCorrect(q, [['A', 'A']])).toBe(false))
})

describe('isCorrect — question double', () => {
  const q = question(single, yesNo)
  it('2 parties justes → juste', () => expect(isCorrect(q, [['B'], ['D']])).toBe(true))
  it('1re partie fausse → faux', () => expect(isCorrect(q, [['A'], ['D']])).toBe(false))
  it('2e partie fausse → faux', () => expect(isCorrect(q, [['B'], ['C']])).toBe(false))
  it('une partie sans réponse → faux', () => expect(isCorrect(q, [['B'], []])).toBe(false))
  it('nombre de parties incorrect → faux', () => expect(isCorrect(q, [['B']])).toBe(false))
})

describe('answerKind / togglePick', () => {
  it('une bonne réponse, 1 partie → single', () => expect(answerKind(question(single))).toBe('single'))
  it('plusieurs bonnes réponses → multi', () => expect(answerKind(question(multi))).toBe('multi'))
  it('question double → double', () => expect(answerKind(question(single, yesNo))).toBe('double'))
  it('une bonne réponse : le tap remplace', () => expect(togglePick(single, ['A'], 'C')).toEqual(['C']))
  it('plusieurs bonnes réponses : le tap coche puis décoche', () => {
    expect(togglePick(multi, ['A'], 'B')).toEqual(['A', 'B'])
    expect(togglePick(multi, ['A', 'B'], 'A')).toEqual(['B'])
  })
})
