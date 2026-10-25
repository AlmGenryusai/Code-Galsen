import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { getQuestions } from '../../lib/quiz/questions'
import { RoadSign } from './RoadSign'
import { SIGNS } from './signs'

const questions = getQuestions()
const SIGNS_DIR = join(__dirname, '../../public/signs')
const swSource = readFileSync(join(__dirname, '../../public/sw.js'), 'utf8')

describe('panneaux', () => {
  it.each(Object.keys(SIGNS))('%s se rend sans erreur, accessible', (id) => {
    const html = renderToStaticMarkup(<RoadSign id={id} />)
    const sign = SIGNS[id]
    if (sign.file) {
      expect(html).toContain(`src="/signs/${sign.file}.svg"`)
      expect(html).toContain(`alt="${sign.label}"`)
    } else {
      expect(html).toContain('<svg')
      expect(html).toContain('role="img"')
      expect(html).toContain(`aria-label="${sign.label}"`)
    }
  })

  it('chaque média `sign` du JSON existe dans signs.tsx', () => {
    const unknown = questions.filter((q) => q.media?.kind === 'sign' && !(q.media.src in SIGNS))
    expect(unknown.map((q) => q.id)).toEqual([])
  })

  const files = Object.values(SIGNS).flatMap((s) => (s.file ? [s.file] : []))

  it.each(files)('public/signs/%s.svg existe, ≤ 6 Ko, sans reste d’éditeur, précaché', (file) => {
    const path = join(SIGNS_DIR, `${file}.svg`)
    expect(existsSync(path)).toBe(true)
    expect(statSync(path).size).toBeLessThanOrEqual(6 * 1024)
    const svg = readFileSync(path, 'utf8')
    expect(svg).toMatch(/viewBox="/)
    expect(svg).not.toMatch(/<\?xml|<!DOCTYPE|<!--|sodipodi|inkscape|enable-background/)
    expect(swSource).toContain(`'${file}'`)
  })
})
