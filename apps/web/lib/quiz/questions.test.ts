// Règles de publication — doc 43 §4. Échoue si une question viole une règle.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TAXONOMY } from './taxonomy'
import type { QuestionV2 } from './types'
import { getQuestions, getThemes } from './questions'
import { pickSeries, seriesCardSize } from './series'
import { pickExamQuestions } from './exam'
import { FREE_THEME } from '../license/license'

const DIR = join(__dirname, '../../content/questions')
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
const loaded = files.map((f) => ({
  chapter: f.replace(/\.json$/, ''),
  questions: JSON.parse(readFileSync(join(DIR, f), 'utf8')) as QuestionV2[],
}))
const all = loaded.flatMap((l) => l.questions.map((q) => ({ file: l.chapter, q })))

function violations(file: string, q: QuestionV2): string[] {
  const v: string[] = []
  if (q.status === 'published' && !q.review?.moniteur) v.push('published sans review.moniteur')
  if (q.legal_status === 'confirmed' && (!q.legal_ref || !q.review?.juriste)) {
    v.push('confirmed sans legal_ref ou sans review.juriste')
  }
  if (q.legal_status === 'pending' && q.status === 'published') v.push('pending ne peut pas être published')
  if (q.media) {
    if (!q.media.alt?.trim()) v.push('media.alt manquant')
    if (!q.media.credit?.trim()) v.push('media.credit manquant')
    const m = q.media.marker
    if (m && !(m.x >= 0 && m.x <= 100 && m.y >= 0 && m.y <= 100)) v.push('media.marker hors 0-100')
  }
  if (q.parts.length < 1 || q.parts.length > 2) v.push('1 ou 2 parties attendues')
  for (const p of q.parts) {
    const ids = p.options.map((o) => o.id)
    if (ids.length < 2 || ids.length > 4) v.push('2 à 4 options par partie')
    if (new Set(ids).size !== ids.length) v.push('ids d’options en double')
    if (p.correct.length < 1) v.push('au moins 1 bonne réponse')
    if (p.correct.some((c) => !ids.includes(c))) v.push('bonne réponse absente des options')
    if (new Set(p.correct).size !== p.correct.length) v.push('bonnes réponses en double')
  }
  const theme = TAXONOMY.find((t) => t.id === q.theme)
  if (!theme) v.push(`theme inconnu : ${q.theme}`)
  if (!theme?.chapters.some((c) => c.id === q.chapter)) v.push(`chapter inconnu : ${q.chapter}`)
  if (q.chapter !== file) v.push(`chapter ${q.chapter} ≠ fichier ${file}`)
  if (!q.id.startsWith(`${q.chapter}-`)) v.push('id non préfixé par son chapitre')
  return v
}

describe('content/questions/*.json', () => {
  it('contient des questions', () => expect(all.length).toBeGreaterThan(0))

  it('chaque fichier est importé par lib/quiz/questions.ts', () => {
    const src = readFileSync(join(__dirname, 'questions.ts'), 'utf8')
    const missing = files.filter((f) => !src.includes(`content/questions/${f}`))
    expect(missing).toEqual([])
  })

  it('ids uniques sur tous les fichiers', () => {
    const ids = all.map(({ q }) => q.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it.each(all.map(({ file, q }) => [q.id, file, q] as const))('%s respecte les règles de publication', (_id, file, q) => {
    expect(violations(file, q)).toEqual([])
  })

  it('getQuestions() renvoie tout le contenu', () => {
    expect(getQuestions().length).toBe(all.length)
  })
})

describe('règles de publication — détection', () => {
  const base: QuestionV2 = {
    id: 't01-c01-0001',
    theme: 't01',
    chapter: 't01-c01',
    parts: [{ text: 'x', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], correct: ['A'] }],
    explanation: '',
    legal_ref: null,
    legal_status: 'not_regulatory',
    status: 'draft',
  }
  it('question valide → aucune violation', () => expect(violations('t01-c01', base)).toEqual([]))
  it('published sans moniteur', () => {
    expect(violations('t01-c01', { ...base, status: 'published' })).toContain('published sans review.moniteur')
  })
  it('confirmed sans ref', () => {
    expect(violations('t01-c01', { ...base, legal_status: 'confirmed' })).toContain(
      'confirmed sans legal_ref ou sans review.juriste',
    )
  })
  it('pending + published', () => {
    const q = { ...base, legal_status: 'pending' as const, status: 'published' as const, review: { moniteur: '2026-01-01' } }
    expect(violations('t01-c01', q)).toContain('pending ne peut pas être published')
  })
  it('média sans alt/credit, marker hors bornes', () => {
    const q = { ...base, media: { kind: 'photo' as const, src: 'a.webp', alt: '', credit: '', marker: { x: 101, y: 5 } } }
    expect(violations('t01-c01', q)).toEqual(['media.alt manquant', 'media.credit manquant', 'media.marker hors 0-100'])
  })
  it('options hors 2-4, sans bonne réponse, ids en double', () => {
    const one = { ...base, parts: [{ text: 'x', options: [{ id: 'A' as const, text: 'a' }], correct: [] }] as QuestionV2['parts'] }
    expect(violations('t01-c01', one)).toEqual(expect.arrayContaining(['2 à 4 options par partie', 'au moins 1 bonne réponse']))
    const dup = { ...base, parts: [{ text: 'x', options: [{ id: 'A' as const, text: 'a' }, { id: 'A' as const, text: 'b' }], correct: ['A' as const] }] as QuestionV2['parts'] }
    expect(violations('t01-c01', dup)).toContain('ids d’options en double')
  })
  it('thème / chapitre inconnus, id mal préfixé', () => {
    const v = violations('t99-c01', { ...base, theme: 't99', chapter: 't99-c01', id: 'x-1' })
    expect(v).toEqual(expect.arrayContaining(['theme inconnu : t99', 'chapter inconnu : t99-c01', 'id non préfixé par son chapitre']))
  })
})

const isIsoDate = (s: unknown) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

describe('relecture moniteur', () => {
  it('toute question reviewed a review.moniteur en date ISO valide', () => {
    const bad = all.filter(({ q }) => q.status === 'reviewed' && !isIsoDate(q.review?.moniteur))
    expect(bad.map(({ q }) => q.id)).toEqual([])
  })
  it('isIsoDate refuse les dates impossibles', () => {
    expect(isIsoDate('2026-10-25')).toBe(true)
    for (const s of ['2026-13-45', '2026-02-30', '25/10/2026', '2026-1-5', undefined]) expect(isIsoDate(s)).toBe(false)
  })
})

describe('thème gratuit t04 — pool réel', () => {
  const pool = getQuestions(FREE_THEME)

  it('30 questions, ids uniques préfixés par leur chapitre, aucune published', () => {
    expect(pool).toHaveLength(30)
    expect(new Set(pool.map((q) => q.id)).size).toBe(30)
    expect(pool.every((q) => q.id.startsWith(`${q.chapter}-`))).toBe(true)
    expect(pool.filter((q) => q.status === 'published')).toEqual([])
  })

  it('série thématique : 10 questions distinctes parmi 30', () => {
    const out = pickSeries(getQuestions(), FREE_THEME)
    expect(out).toHaveLength(10)
    expect(new Set(out.map((q) => q.id)).size).toBe(10)
  })

  it('carte Séries sans licence : 10 questions', () => {
    const free = getThemes().filter((t) => t.theme === FREE_THEME).map((t) => t.count)
    expect(seriesCardSize(free)).toBe(10)
  })

  it('examen blanc gratuit : tout le pool t04 (30 < 40), sans doublon', () => {
    const out = pickExamQuestions(pool)
    expect(out).toHaveLength(30)
    expect(new Set(out.map((q) => q.id)).size).toBe(30)
  })
})
