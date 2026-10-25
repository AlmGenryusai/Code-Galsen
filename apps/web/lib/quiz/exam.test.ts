import { describe, it, expect } from 'vitest'
import { pickExamQuestions, scoreByTheme, targetScore } from './exam'
import type { QuestionV2 } from './types'

function qs(theme: string, n: number): QuestionV2[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${theme}-${i}`,
    theme,
    chapter: `${theme}-c01`,
    parts: [{ text: '', options: [], correct: ['A'] }],
    explanation: '',
    legal_ref: null,
    legal_status: 'not_regulatory',
    status: 'draft',
  })) as QuestionV2[]
}

const countBy = (list: QuestionV2[], theme: string) => list.filter((q) => q.theme === theme).length

describe('pickExamQuestions', () => {
  it('pool vide → liste vide', () => {
    expect(pickExamQuestions([], 40)).toEqual([])
  })

  it('pool plus petit que count → tout, sans doublon', () => {
    const pool = [...qs('t01', 9), ...qs('t04', 5)]
    const out = pickExamQuestions(pool, 40)
    expect(out).toHaveLength(14)
    expect(new Set(out.map((q) => q.id)).size).toBe(14)
  })

  it('pool = count → tout', () => {
    expect(pickExamQuestions(qs('t01', 40), 40)).toHaveLength(40)
  })

  it('répartition proportionnelle au volume', () => {
    const pool = [...qs('t01', 150), ...qs('t02', 50)]
    const out = pickExamQuestions(pool, 40)
    expect(out).toHaveLength(40)
    expect(countBy(out, 't01')).toBe(30)
    expect(countBy(out, 't02')).toBe(10)
  })

  it('somme exacte quand les parts sont fractionnaires, sans doublon', () => {
    const pool = [...qs('t01', 7), ...qs('t02', 7), ...qs('t03', 7)]
    const out = pickExamQuestions(pool, 10)
    expect(out).toHaveLength(10)
    expect(new Set(out.map((q) => q.id)).size).toBe(10)
    for (const t of ['t01', 't02', 't03']) expect([3, 4]).toContain(countBy(out, t))
  })

  it('un seul thème', () => {
    expect(pickExamQuestions(qs('t01', 100), 40)).toHaveLength(40)
  })

  it('thème minuscule jamais sur-tiré', () => {
    const out = pickExamQuestions([...qs('t01', 99), ...qs('t02', 1)], 40)
    expect(out).toHaveLength(40)
    expect(countBy(out, 't02')).toBeLessThanOrEqual(1)
  })
})

describe('scoreByTheme', () => {
  it('compte juste/total par thème, ordre taxonomie', () => {
    const out = scoreByTheme([
      { theme: 't04', correct: true },
      { theme: 't01', correct: true },
      { theme: 't01', correct: false },
      { theme: 't04', correct: false },
      { theme: 't04', correct: false },
    ])
    expect(out).toEqual([
      { theme: 't01', correct: 1, total: 2 },
      { theme: 't04', correct: 1, total: 3 },
    ])
  })

  it('aucune réponse → vide', () => {
    expect(scoreByTheme([])).toEqual([])
  })
})

describe('targetScore', () => {
  it('80 % arrondi au-dessus', () => {
    expect(targetScore(40)).toBe(32)
    expect(targetScore(14)).toBe(12)
  })
})
