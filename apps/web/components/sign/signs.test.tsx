import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import data from '../../content/questions.json'
import type { Question } from '../../lib/quiz/types'
import { RoadSign } from './RoadSign'
import { SIGNS } from './signs'

const questions = data as Question[]

describe('panneaux SVG', () => {
  it.each(Object.keys(SIGNS))('%s se rend sans erreur, accessible', (id) => {
    const html = renderToStaticMarkup(<RoadSign id={id} />)
    expect(html).toContain('<svg')
    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${SIGNS[id].label}"`)
  })

  it('chaque `sign` du JSON existe dans signs.tsx', () => {
    const unknown = questions.filter((q) => q.sign !== undefined && !(q.sign in SIGNS))
    expect(unknown.map((q) => q.id)).toEqual([])
  })
})
