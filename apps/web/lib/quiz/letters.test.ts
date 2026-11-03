import { describe, it, expect } from 'vitest'
import { correctLetters, correctLettersText, formatLetters, partSlots } from './letters'
import { getQuestions } from './questions'
import type { ChoicePart, Part, QuestionV2 } from './types'

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

const choice: ChoicePart = {
  text: 'x',
  options: [
    { id: 'A', text: 'x' },
    { id: 'B', text: 'y' },
    { id: 'C', text: 'z' },
    { id: 'D', text: 'w' },
  ],
  correct: ['B'], // « y »
}

describe('partSlots — ordre affiché', () => {
  it('sans mélange : lettre = id', () => {
    expect(partSlots(question(choice))[0].map((s) => s.letter)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('avec mélange : la lettre suit la position affichée, pas l’id JSON', () => {
    const q = question(choice)
    const slots = partSlots(q, [['C', 'A', 'D', 'B']])[0]
    expect(slots.map((s) => s.label)).toEqual(['z', 'x', 'w', 'y'])
    expect(slots.map((s) => s.letter)).toEqual(['A', 'B', 'C', 'D'])
    // « y » (id B) est affichée en D
    expect(slots.find((s) => s.id === 'B')?.letter).toBe('D')
  })

  it('correctLetters / texte suivent l’ordre affiché (shuffle actif)', () => {
    const q = question(choice)
    expect(correctLetters(q, [['C', 'A', 'D', 'B']])).toEqual(['D'])
    expect(correctLettersText(q, [['C', 'A', 'D', 'B']])).toBe('Bonne réponse : D')
    expect(correctLettersText(q)).toBe('Bonne réponse : B')
  })

  it('plusieurs bonnes réponses : triées, au pluriel', () => {
    const q = question({ ...choice, correct: ['A', 'C'] })
    expect(correctLettersText(q)).toBe('Bonnes réponses : A et C')
    // A→position 2 (B), C→position 0 (A)
    expect(correctLettersText(q, [['C', 'D', 'A', 'B']])).toBe('Bonnes réponses : A et C')
    expect(correctLetters(q, [['B', 'A', 'D', 'C']])).toEqual(['B', 'D'])
  })

  it('yesno : OUI/NON = A/B puis C/D, jamais mélangés', () => {
    const q = question(
      { kind: 'yesno', statement: 'a', correct: 'no' },
      { kind: 'yesno', statement: 'b', correct: 'yes' },
    )
    expect(partSlots(q).map((p) => p.map((s) => `${s.label}=${s.letter}`))).toEqual([
      ['OUI=A', 'NON=B'],
      ['OUI=C', 'NON=D'],
    ])
    expect(correctLettersText(q)).toBe('Bonnes réponses : B et C')
  })
})

describe('formatLetters', () => {
  it('formate 1, 2, 3 lettres', () => {
    expect(formatLetters(['A'])).toBe('A')
    expect(formatLetters(['A', 'C'])).toBe('A et C')
    expect(formatLetters(['A', 'B', 'C'])).toBe('A, B et C')
  })
})

describe('contenu publié', () => {
  it('4 cases au plus par question', () => {
    const bad = getQuestions().filter((q) => partSlots(q).flat().length > 4).map((q) => q.id)
    expect(bad).toEqual([])
  })
})
