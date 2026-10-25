// Règles de publication des fiches — doc 62 §3 + doc 43 §4. Échoue si une fiche viole une règle.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TAXONOMY } from '../quiz/taxonomy'
import type { Media } from '../quiz/types'
import { allSheetIds, getLessons, parseSheetParam, sheetMinutes, sheetWords, sheetHref } from './lessons'
import type { Block, LessonFile, Sheet } from './types'

const MAX_WORDS = 900
const MAX_SHEETS = 5

const DIR = join(__dirname, '../../content/lessons')
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
const all = files.map((f) => ({
  file: f.replace(/\.json$/, ''),
  lesson: JSON.parse(readFileSync(join(DIR, f), 'utf8')) as LessonFile,
}))

function mediaOf(b: Block): (Media | undefined)[] {
  if (b.type === 'image') return [b.media]
  if (b.type === 'table') return b.rows.map((r) => r.media)
  return []
}

function violations(file: string, l: LessonFile): string[] {
  const v: string[] = []
  const chapter = TAXONOMY.flatMap((t) => t.chapters).find((c) => c.id === l.id)
  if (!chapter) v.push(`id ne correspond à aucun chapitre : ${l.id}`)
  if (l.id !== file) v.push(`id ${l.id} ≠ fichier ${file}`)
  if (l.theme !== l.id.split('-')[0]) v.push(`theme ${l.theme} ≠ préfixe de ${l.id}`)
  if (!l.sheets?.length || l.sheets.length > MAX_SHEETS) v.push(`1 à ${MAX_SHEETS} fiches (${l.sheets?.length ?? 0})`)
  const seen = new Set<string>()
  for (const s of l.sheets ?? []) {
    if (!new RegExp(`^${l.id}-f\\d\\d$`).test(s.id)) v.push(`id de fiche invalide : ${s.id}`)
    if (seen.has(s.id)) v.push(`id de fiche en double : ${s.id}`)
    seen.add(s.id)
    if (!s.blocks.some((b) => b.type === 'text')) v.push(`${s.id} : aucun bloc text`)
    if (s.blocks.filter((b) => b.type === 'attention' || b.type === 'memo').length > 2) {
      v.push(`${s.id} : plus de 2 blocs attention/memo`)
    }
    if (sheetWords(s) > MAX_WORDS) v.push(`${s.id} : plus de ${MAX_WORDS} mots`)
    for (const m of s.blocks.flatMap(mediaOf)) {
      if (!m) continue
      if (!m.alt?.trim()) v.push(`${s.id} : media.alt manquant`)
      if (!m.credit?.trim()) v.push(`${s.id} : media.credit manquant`)
    }
  }
  if (l.status === 'published') {
    if (!l.legal_ref?.trim()) v.push('published sans legal_ref')
    if (!l.review?.moniteur) v.push('published sans review.moniteur')
  }
  if (l.status === 'published' && l.legal_status === 'pending') v.push('pending ne peut pas être published')
  return v
}

const isIsoDate = (s: unknown) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

describe('content/lessons/*.json', () => {
  it('contient des fiches', () => expect(all.length).toBeGreaterThan(0))

  it('chaque fichier reviewed a review.moniteur en date ISO valide', () => {
    const bad = all.filter(({ lesson }) => lesson.status === 'reviewed' && !isIsoDate(lesson.review?.moniteur))
    expect(bad.map(({ file }) => file)).toEqual([])
  })

  it('chaque fichier est importé par lib/lessons/lessons.ts', () => {
    const src = readFileSync(join(__dirname, 'lessons.ts'), 'utf8')
    expect(files.filter((f) => !src.includes(`content/lessons/${f}`))).toEqual([])
  })

  it('ids de chapitre uniques', () => {
    const ids = all.map(({ lesson }) => lesson.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('ids de fiche uniques dans tout le contenu', () => {
    const ids = all.flatMap(({ lesson }) => lesson.sheets.map((s) => s.id))
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
    expect(allSheetIds().length).toBe(all.reduce((n, { lesson }) => n + lesson.sheets.length, 0))
  })
})

const text = (t: string): Block => ({ type: 'text', text: t })
const media: Media = { kind: 'photo', src: 'a.webp', alt: 'alt', credit: 'Alfred' }

describe('règles de publication des fiches — détection', () => {
  const sheet: Sheet = { id: 't04-c01-f01', title: 'T', blocks: [text('a')] }
  const base: LessonFile = {
    id: 't04-c01',
    theme: 't04',
    sheets: [sheet],
    legal_ref: null,
    legal_status: 'pending',
    status: 'draft',
  }
  const withBlocks = (blocks: Block[]): LessonFile => ({ ...base, sheets: [{ ...sheet, blocks }] })

  it('fiche valide : aucune violation', () => expect(violations('t04-c01', base)).toEqual([]))

  it('id inconnu', () => {
    expect(violations('t99-c01', { ...base, id: 't99-c01', theme: 't99' })).toContain(
      'id ne correspond à aucun chapitre : t99-c01',
    )
  })

  it('id ≠ fichier', () => expect(violations('t04-c02', base)).toContain('id t04-c01 ≠ fichier t04-c02'))

  it('0 ou plus de 5 fiches', () => {
    expect(violations('t04-c01', { ...base, sheets: [] })).toContain('1 à 5 fiches (0)')
    const six = Array.from({ length: 6 }, (_, i) => ({ ...sheet, id: `t04-c01-f0${i + 1}` }))
    expect(violations('t04-c01', { ...base, sheets: six })).toContain('1 à 5 fiches (6)')
    expect(violations('t04-c01', { ...base, sheets: six.slice(0, 5) })).toEqual([])
  })

  it('id de fiche mal formé ou en double', () => {
    expect(violations('t04-c01', { ...base, sheets: [{ ...sheet, id: 't04-c02-f01' }] })).toContain(
      'id de fiche invalide : t04-c02-f01',
    )
    expect(violations('t04-c01', { ...base, sheets: [{ ...sheet, id: 't04-c01-f1' }] })).toContain(
      'id de fiche invalide : t04-c01-f1',
    )
    expect(violations('t04-c01', { ...base, sheets: [sheet, sheet] })).toContain('id de fiche en double : t04-c01-f01')
  })

  it('aucun bloc text', () => {
    expect(violations('t04-c01', withBlocks([{ type: 'heading', text: 'x' }]))).toContain(
      't04-c01-f01 : aucun bloc text',
    )
  })

  it('plus de 2 blocs attention/memo', () => {
    const three: Block[] = [text('a'), { type: 'attention', text: 'b' }, { type: 'memo', text: 'c' }, { type: 'attention', text: 'd' }]
    expect(violations('t04-c01', withBlocks(three))).toContain('t04-c01-f01 : plus de 2 blocs attention/memo')
    expect(violations('t04-c01', withBlocks(three.slice(0, 3)))).toEqual([])
  })

  it('plus de 900 mots', () => {
    const long = Array(MAX_WORDS + 1).fill('mot').join(' ')
    expect(violations('t04-c01', withBlocks([text(long)]))).toContain(`t04-c01-f01 : plus de ${MAX_WORDS} mots`)
    expect(violations('t04-c01', withBlocks([text(Array(MAX_WORDS).fill('mot').join(' '))]))).toEqual([])
  })

  it('published sans legal_ref', () => {
    const l: LessonFile = { ...base, status: 'published', legal_status: 'sourced', review: { moniteur: '2026-10-25' } }
    expect(violations('t04-c01', l)).toContain('published sans legal_ref')
  })

  it('published sans review', () => {
    const l: LessonFile = { ...base, status: 'published', legal_status: 'sourced', legal_ref: 'décret 2004-13' }
    expect(violations('t04-c01', l)).toContain('published sans review.moniteur')
  })

  it('published avec legal_ref et review : accepté', () => {
    const l: LessonFile = {
      ...base,
      status: 'published',
      legal_status: 'sourced',
      legal_ref: 'décret 2004-13',
      review: { moniteur: '2026-10-25' },
    }
    expect(violations('t04-c01', l)).toEqual([])
  })

  it('media sans alt ni credit (image et ligne de table)', () => {
    const bad = { ...media, alt: ' ', credit: '' }
    expect(violations('t04-c01', withBlocks([text('a'), { type: 'image', media: bad }]))).toEqual([
      't04-c01-f01 : media.alt manquant',
      't04-c01-f01 : media.credit manquant',
    ])
    const table: Block = { type: 'table', head: ['A', 'B'], rows: [{ label: 'l', text: 't', media: bad }] }
    expect(violations('t04-c01', withBlocks([text('a'), table]))).toContain('t04-c01-f01 : media.alt manquant')
    expect(violations('t04-c01', withBlocks([text('a'), { type: 'image', media }]))).toEqual([])
  })
})

describe('sheetMinutes', () => {
  const words = (n: number): Sheet => ({ id: 'x', title: 'x', blocks: [text(Array(n).fill('mot').join(' '))] })

  it.each([
    [0, 1],
    [1, 1],
    [200, 1],
    [201, 2],
    [400, 2],
    [401, 3],
  ])('%i mots → %i min', (n, min) => expect(sheetMinutes(words(n))).toBe(min))

  it('compte tous les types de bloc', () => {
    const s: Sheet = {
      id: 'x',
      title: 'x',
      blocks: [
        { type: 'heading', text: 'un deux' },
        { type: 'list', items: ['trois quatre', 'cinq'] },
        { type: 'attention', text: 'six' },
        { type: 'memo', text: 'sept' },
        { type: 'table', head: ['huit', 'neuf'], rows: [{ label: 'dix', text: 'onze douze' }] },
        { type: 'image', media, caption: 'treize' },
      ],
    }
    expect(sheetWords(s)).toBe(13)
  })
})

describe('liens et paramètre f', () => {
  it('sheetHref', () => {
    expect(sheetHref('t04-c01')).toBe('/fiches?c=t04-c01')
    expect(sheetHref('t04-c01', 2)).toBe('/fiches?c=t04-c01&f=2')
  })

  it('parseSheetParam : 1..count, sinon null', () => {
    expect(parseSheetParam('1', 3)).toBe(1)
    expect(parseSheetParam('3', 3)).toBe(3)
    for (const bad of [null, '', '0', '4', '-1', '1.5', 'abc', '01']) expect(parseSheetParam(bad, 3)).toBeNull()
  })
})
