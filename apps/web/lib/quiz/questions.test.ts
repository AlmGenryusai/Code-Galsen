import { describe, it, expect } from 'vitest'
import data from '../../content/questions.json'
import type { Question } from './types'

const questions = data as Question[]

describe('content/questions.json', () => {
  it('contient des questions', () => {
    expect(questions.length).toBeGreaterThan(0)
  })

  it.each(questions.map((q) => [q.id, q] as const))(
    '%s : ids d’options uniques et exactement une bonne réponse',
    (_id, q) => {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.filter((id) => id === q.correctId)).toHaveLength(1)
    },
  )
})
