import { describe, it, expect } from 'vitest'
import { countDue } from '../quiz/srs'
import {
  emptyProgress,
  parseProgress,
  themeErrorRates,
  themeProgress,
  withAnswer,
  withSeries,
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
      srs: {},
      series: {},
    }
    expect(parseProgress(JSON.stringify(p))).toEqual(p)
  })

  it('progression sans srs (avant session 5) → réponses conservées, srs vide', () => {
    const old = {
      answers: { a1: { correct: 1, wrong: 2, lastAnsweredAt: T0.toISOString() } },
      exams: [{ id: 'e1', date: T0.toISOString(), score: 80, faults: 3, total: 15, passed: true }],
    }
    expect(parseProgress(JSON.stringify(old))).toEqual({ ...old, srs: {}, series: {} })
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

describe('withAnswer — file SRS', () => {
  it('mauvaise réponse → entre dans la file, à réviser tout de suite', () => {
    const p = withAnswer(emptyProgress(), 'a1', false, T0)
    expect(p.srs.a1).toMatchObject({ questionId: 'a1', nextReviewAt: T0.toISOString(), intervalDays: 1, failCount: 1 })
    expect(countDue(Object.values(p.srs), T0)).toBe(1)
  })

  it('bonne réponse hors file → rien', () => {
    expect(withAnswer(emptyProgress(), 'a1', true, T0).srs).toEqual({})
  })

  it('bonne réponse en file → review (streak +1)', () => {
    let p = withAnswer(emptyProgress(), 'a1', false, T0)
    p = withAnswer(p, 'a1', true, T0)
    expect(p.srs.a1.successStreak).toBe(1)
    expect(p.srs.a1.lastReviewedAt).toBe(T0.toISOString())
  })

  it('mauvaise réponse en file → failCount +1', () => {
    let p = withAnswer(emptyProgress(), 'a1', false, T0)
    p = withAnswer(p, 'a1', false, T0)
    expect(p.srs.a1.failCount).toBe(2)
  })

  it('3 bonnes réponses consécutives → retirée de la file', () => {
    let p = withAnswer(emptyProgress(), 'a1', false, T0)
    for (let i = 0; i < 3; i++) p = withAnswer(p, 'a1', true, T0)
    expect(p.srs).toEqual({})
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

describe('séries', () => {
  const R = { score: 7, total: 10, date: T0.toISOString() }

  it('withSeries enregistre la note du thème', () => {
    expect(withSeries(emptyProgress(), 'A', R).series).toEqual({ A: R })
  })

  it('withSeries écrase la note précédente, sans toucher aux autres thèmes', () => {
    const p = withSeries(withSeries(emptyProgress(), 'A', R), 'B', { ...R, score: 3 })
    const next = withSeries(p, 'A', { ...R, score: 9 })
    expect(next.series.A.score).toBe(9)
    expect(next.series.B.score).toBe(3)
  })

  it('parseProgress relit series', () => {
    const raw = JSON.stringify({ answers: {}, exams: [], series: { A: R } })
    expect(parseProgress(raw).series).toEqual({ A: R })
  })

  it('parseProgress sans champ series (ancienne progression) → {}', () => {
    const raw = JSON.stringify({ answers: {}, exams: [], srs: {} })
    expect(parseProgress(raw).series).toEqual({})
  })

  it('parseProgress avec series invalide → {}', () => {
    const raw = JSON.stringify({ answers: {}, exams: [], series: [1] })
    expect(parseProgress(raw).series).toEqual({})
  })
})
