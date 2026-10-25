import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { getQuestions } from '../../lib/quiz/questions'
import { RoadSign } from './RoadSign'
import { SIGNS } from './signs'

const questions = getQuestions()

describe('panneaux SVG', () => {
  it.each(Object.keys(SIGNS))('%s se rend sans erreur, accessible', (id) => {
    const html = renderToStaticMarkup(<RoadSign id={id} />)
    expect(html).toContain('<svg')
    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${SIGNS[id].label}"`)
  })

  it('chaque média `sign` du JSON existe dans signs.tsx', () => {
    const unknown = questions.filter((q) => q.media?.kind === 'sign' && !(q.media.src in SIGNS))
    expect(unknown.map((q) => q.id)).toEqual([])
  })
})
