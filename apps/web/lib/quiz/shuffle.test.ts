import { describe, expect, it } from 'vitest'
import { orderFor } from './shuffle'
import { correctLetters } from './letters'
import { getQuestions } from './questions'
import type { QuestionV2 } from './types'

const base = {
  theme: 't01',
  chapter: 't01-c01',
  explanation: '',
  legal_ref: null,
  legal_status: 'not_regulatory' as const,
  status: 'published' as const,
}
const choice = (id: string, shuffle?: boolean): QuestionV2 => ({
  ...base,
  id,
  parts: [
    {
      text: 'q',
      options: [
        { id: 'A', text: 'a' },
        { id: 'B', text: 'b' },
        { id: 'C', text: 'c' },
        { id: 'D', text: 'd' },
      ],
      correct: ['B'],
      shuffle,
    },
  ],
})

describe('orderFor', () => {
  it('est déterministe et contient chaque id une fois', () => {
    const q = choice('t01-c01-0001')
    const o = orderFor(q)
    expect(orderFor(q)).toEqual(o)
    expect([...o[0]].sort()).toEqual(['A', 'B', 'C', 'D'])
  })
  it('garde l’ordre du JSON si shuffle est false et pour OUI/NON', () => {
    expect(orderFor(choice('x', false))[0]).toEqual(['A', 'B', 'C', 'D'])
    const yn: QuestionV2 = { ...base, id: 'y', parts: [{ kind: 'yesno', statement: 's', correct: 'yes' }] }
    expect(orderFor(yn)).toEqual([[]])
  })
  it('la lettre affichée de la bonne réponse suit le mélange', () => {
    const q = choice('t01-c01-0042')
    const o = orderFor(q)
    expect(correctLetters(q, o)).toEqual(['ABCD'[o[0].indexOf('B')]])
  })
})

describe('répartition sur les questions publiées', () => {
  const published = getQuestions().filter((q) => q.status === 'published')
  const parts = published.flatMap((q) => orderFor(q).map((order, pi) => ({ q, part: q.parts[pi], order })))
  const choices = parts.filter((p) => p.part.kind !== 'yesno')

  it('aucune lettre affichée ne porte plus de 35 % des bonnes réponses', () => {
    const count: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
    let total = 0
    for (const { q, part, order } of choices) {
      if (part.kind === 'yesno') continue
      const letters = correctLetters({ ...q, parts: [part] } as QuestionV2, [order])
      for (const l of letters) {
        count[l]++
        total++
      }
    }
    for (const l of ['A', 'B', 'C', 'D']) expect(count[l] / total).toBeLessThanOrEqual(0.35)
  })

  // Thèmes réécrits au format examen : la plus longue ne doit pas être la bonne réponse trop souvent.
  const REWRITTEN = ['t01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10']
  it('thèmes réécrits : la bonne réponse est la plus longue dans moins de 40 % des cas', () => {
    let n = 0
    let longest = 0
    for (const { q, part } of choices) {
      if (!REWRITTEN.includes(q.theme) || part.kind === 'yesno') continue
      const lens = part.options.map((o) => o.text.length)
      const max = Math.max(...lens)
      n++
      if (lens.filter((l) => l === max).length === 1 && part.options.some((o) => o.text.length === max && part.correct.includes(o.id))) longest++
    }
    expect(n).toBeGreaterThan(0)
    expect(longest / n).toBeLessThan(0.4)
  })
})
