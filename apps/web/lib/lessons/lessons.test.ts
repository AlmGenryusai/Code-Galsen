// Règles de publication des fiches — doc 47 + doc 43 §4. Échoue si une fiche viole une règle.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TAXONOMY } from '../quiz/taxonomy'
import { getLessons, LESSON_BLOCKS } from './lessons'
import type { Lesson } from './types'

const MAX_WORDS = 900

const DIR = join(__dirname, '../../content/lessons')
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
const all = files.map((f) => ({
  file: f.replace(/\.json$/, ''),
  lesson: JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Lesson,
}))

function wordCount(l: Lesson): number {
  return Object.values(l.blocks).join(' ').split(/\s+/).filter(Boolean).length
}

function violations(file: string, l: Lesson): string[] {
  const v: string[] = []
  const chapter = TAXONOMY.flatMap((t) => t.chapters).find((c) => c.id === l.id)
  if (!chapter) v.push(`id ne correspond à aucun chapitre : ${l.id}`)
  if (l.id !== file) v.push(`id ${l.id} ≠ fichier ${file}`)
  if (l.theme !== l.id.split('-')[0]) v.push(`theme ${l.theme} ≠ préfixe de ${l.id}`)
  for (const { key } of LESSON_BLOCKS) {
    if (!l.blocks?.[key]?.trim()) v.push(`bloc ${key} vide`)
  }
  if (wordCount(l) > MAX_WORDS) v.push(`plus de ${MAX_WORDS} mots`)
  if (l.status === 'published') {
    if (!l.legal_ref?.trim()) v.push('published sans legal_ref')
    if (!l.review?.moniteur) v.push('published sans review.moniteur')
  }
  if (l.status === 'published' && l.legal_status === 'pending') v.push('pending ne peut pas être published')
  if (l.media) {
    if (!l.media.alt?.trim()) v.push('media.alt manquant')
    if (!l.media.credit?.trim()) v.push('media.credit manquant')
  }
  return v
}

describe('content/lessons/*.json', () => {
  it('contient des fiches', () => expect(all.length).toBeGreaterThan(0))

  it('chaque fichier est importé par lib/lessons/lessons.ts', () => {
    const src = readFileSync(join(__dirname, 'lessons.ts'), 'utf8')
    expect(files.filter((f) => !src.includes(`content/lessons/${f}`))).toEqual([])
  })

  it('ids uniques', () => {
    const ids = all.map(({ lesson }) => lesson.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it.each(all.map(({ file, lesson }) => [lesson.id, file, lesson] as const))(
    '%s respecte les règles de publication',
    (_id, file, lesson) => {
      expect(violations(file, lesson)).toEqual([])
    },
  )

  it('getLessons() renvoie tout le contenu', () => {
    expect(getLessons().length).toBe(all.length)
  })
})

describe('règles de publication des fiches — détection', () => {
  const base: Lesson = {
    id: 't04-c01',
    theme: 't04',
    blocks: { rule: 'a', why: 'b', situation: 'c', trap: 'd' },
    legal_ref: null,
    legal_status: 'pending',
    status: 'draft',
  }

  it('fiche valide : aucune violation', () => expect(violations('t04-c01', base)).toEqual([]))

  it('id inconnu', () => {
    expect(violations('t99-c01', { ...base, id: 't99-c01', theme: 't99' })).toContain(
      'id ne correspond à aucun chapitre : t99-c01',
    )
  })

  it('id ≠ fichier', () => expect(violations('t04-c02', base)).toContain('id t04-c01 ≠ fichier t04-c02'))

  it('bloc vide ou manquant', () => {
    expect(violations('t04-c01', { ...base, blocks: { ...base.blocks, why: '  ' } })).toContain('bloc why vide')
    const { trap: _t, ...rest } = base.blocks
    expect(violations('t04-c01', { ...base, blocks: rest as Lesson['blocks'] })).toContain('bloc trap vide')
  })

  it('plus de 900 mots', () => {
    const long = Array(MAX_WORDS).fill('mot').join(' ')
    expect(violations('t04-c01', { ...base, blocks: { ...base.blocks, rule: long } })).toContain(
      `plus de ${MAX_WORDS} mots`,
    )
    // 900 mots pile : accepté
    const exact = Array(MAX_WORDS - 3).fill('mot').join(' ')
    expect(violations('t04-c01', { ...base, blocks: { ...base.blocks, rule: exact } })).toEqual([])
  })

  it('published sans legal_ref', () => {
    const l: Lesson = { ...base, status: 'published', legal_status: 'sourced', review: { moniteur: '2026-10-25' } }
    expect(violations('t04-c01', l)).toContain('published sans legal_ref')
  })

  it('published sans review', () => {
    const l: Lesson = { ...base, status: 'published', legal_status: 'sourced', legal_ref: 'décret 2004-13' }
    expect(violations('t04-c01', l)).toContain('published sans review.moniteur')
  })

  it('published avec legal_ref et review : accepté', () => {
    const l: Lesson = {
      ...base,
      status: 'published',
      legal_status: 'sourced',
      legal_ref: 'décret 2004-13',
      review: { moniteur: '2026-10-25' },
    }
    expect(violations('t04-c01', l)).toEqual([])
  })
})
