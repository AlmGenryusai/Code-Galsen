import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { getQuestions } from '../../lib/quiz/questions'
import { RoadSign } from './RoadSign'
import { SIGNS } from './signs'
import { FAMILIES } from './families'

const questions = getQuestions()
const SIGNS_DIR = join(__dirname, '../../public/signs')
const swSource = readFileSync(join(__dirname, '../../public/sw.js'), 'utf8')

describe('panneaux', () => {
  it.each(Object.keys(SIGNS))('%s se rend sans erreur, accessible', (id) => {
    const html = renderToStaticMarkup(<RoadSign id={id} />)
    const sign = SIGNS[id]
    expect(html).toContain(`src="/signs/${sign.file}.svg"`)
    expect(html).toContain(`alt="${sign.label.replace(/'/g, '&#x27;')}"`)
  })

  it('chaque média `sign` du JSON existe dans signs.tsx', () => {
    const unknown = questions.filter((q) => q.media?.kind === 'sign' && !(q.media.src in SIGNS))
    expect(unknown.map((q) => q.id)).toEqual([])
  })

  it('chaque panneau d’une famille existe, sans doublon', () => {
    const ids = FAMILIES.flatMap((f) => f.items)
    expect(ids.filter((id) => !(id in SIGNS))).toEqual([])
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  const files = [...new Set(Object.values(SIGNS).map((s) => s.file))]

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
