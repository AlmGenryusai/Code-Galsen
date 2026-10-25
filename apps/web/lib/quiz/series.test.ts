import { describe, it, expect } from 'vitest'
import { pickSeries } from './series'
import type { QuestionV2 } from './types'

function qs(theme: string, n: number): QuestionV2[] {
  return Array.from({ length: n }, (_, i) => ({ id: `${theme}-${i}`, theme }) as QuestionV2)
}

describe('pickSeries', () => {
  it('thème sans question → liste vide', () => {
    expect(pickSeries(qs('A', 5), 'B')).toEqual([])
  })

  it('thème de plus de 10 questions → 10, sans doublon, du bon thème', () => {
    const out = pickSeries([...qs('A', 25), ...qs('B', 12)], 'A')
    expect(out).toHaveLength(10)
    expect(new Set(out.map((q) => q.id)).size).toBe(10)
    expect(out.every((q) => q.theme === 'A')).toBe(true)
  })

  it('thème de moins de 10 questions → toutes', () => {
    expect(pickSeries(qs('A', 4), 'A')).toHaveLength(4)
  })

  it('tirage déterministe avec rng injecté, pool non modifié', () => {
    const pool = qs('A', 15)
    const ids = pool.map((q) => q.id)
    const rng = () => 0
    expect(pickSeries(pool, 'A', 10, rng)).toEqual(pickSeries(pool, 'A', 10, rng))
    expect(pool.map((q) => q.id)).toEqual(ids)
  })

  it('size personnalisé', () => {
    expect(pickSeries(qs('A', 15), 'A', 3)).toHaveLength(3)
  })
})
