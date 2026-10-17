import { describe, it, expect } from 'vitest'
import {
  emptyProgress,
  parseProgress,
  themeErrorRates,
  themeProgress,
  withAnswer,
  type Progress,
  type QuestionRef,
} from './progress'

const T0 = new Date('2026-06-01T10:00:00Z')

const QUESTIONS: QuestionRef[] = [
  { id: 'a1', theme: 'A' },
  { id: 'a2', theme: 'A' },
  { id: 'b1', theme: 'B' },
  { id: 'c1', theme: 'C' },
]

describe('parseProgress', () => {
  it('null → progression vide', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
  })

  it('JSON invalide → progression vide', () => {
    expect(parseProgress('{pas du json')).toEqual(emptyProgress())
  })

  it('forme invalide → progression vide', () => {
    expect(parseProgress('42')).toEqual(emptyProgress())
    expect(parseProgress('{"answers":"x","exams":[]}')).toEqual(emptyProgress())
    expect(parseProgress('{"answers":{}}')).toEqual(emptyProgress())
  })

  it('JSON valide → relu tel quel', () => {
    const p: Progress = {
      answers: { a1: { correct: 1, wrong: 2, lastAnsweredAt: T0.toISOString() } },
      exams: [{ id: 'e1', date: T0.toISOString(), score: 80, faults: 3, total: 15, passed: true }],
    }
    expect(parseProgress(JSON.stringify(p))).toEqual(p)
  })
})

describe('withAnswer', () => {
  it('incrémente bonnes / mauvaises et met à jour la date', () => {
    const T1 = new Date('2026-06-02T10:00:00Z')
    let p = withAnswer(emptyProgress(), 'a1', true, T0)
    p = withAnswer(p, 'a1', false, T1)
    expect(p.answers.a1).toEqual({ correct: 1, wrong: 1, lastAnsweredAt: T1.toISOString() })
  })
})

describe('themeErrorRates', () => {
  it('calcule le taux par thème, trie, ignore questions inconnues et thèmes sans réponse', () => {
    let p = emptyProgress()
    p = withAnswer(p, 'a1', false, T0)
    p = withAnswer(p, 'a2', true, T0)
    p = withAnswer(p, 'b1', false, T0)
    p = withAnswer(p, 'inconnue', false, T0)

    expect(themeErrorRates(p, QUESTIONS)).toEqual([
      { themeId: 'B', label: 'B', errorRate: 1, questionsAttempted: 1 },
      { themeId: 'A', label: 'A', errorRate: 0.5, questionsAttempted: 2 },
    ])
  })

  it('aucune réponse → liste vide', () => {
    expect(themeErrorRates(emptyProgress(), QUESTIONS)).toEqual([])
  })
})

describe('themeProgress', () => {
  it('0 % sans réponse', () => {
    expect(themeProgress(emptyProgress(), QUESTIONS)).toEqual({ A: 0, B: 0, C: 0 })
  })

  it('% de questions réussies au moins une fois', () => {
    let p = emptyProgress()
    p = withAnswer(p, 'a1', true, T0)
    p = withAnswer(p, 'b1', false, T0)
    expect(themeProgress(p, QUESTIONS)).toEqual({ A: 50, B: 0, C: 0 })
  })
})
