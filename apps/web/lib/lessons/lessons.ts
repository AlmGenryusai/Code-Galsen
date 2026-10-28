import t01c01 from '../../content/lessons/t01-c01.json'
import t01c02 from '../../content/lessons/t01-c02.json'
import t01c03 from '../../content/lessons/t01-c03.json'
import t01c04 from '../../content/lessons/t01-c04.json'
import t01c05 from '../../content/lessons/t01-c05.json'
import t01c06 from '../../content/lessons/t01-c06.json'
import t02c01 from '../../content/lessons/t02-c01.json'
import t02c02 from '../../content/lessons/t02-c02.json'
import t03c01 from '../../content/lessons/t03-c01.json'
import t03c02 from '../../content/lessons/t03-c02.json'
import t03c03 from '../../content/lessons/t03-c03.json'
import t04c01 from '../../content/lessons/t04-c01.json'
import t04c02 from '../../content/lessons/t04-c02.json'
import t04c03 from '../../content/lessons/t04-c03.json'
import t04c04 from '../../content/lessons/t04-c04.json'
import t04c05 from '../../content/lessons/t04-c05.json'
import t05c01 from '../../content/lessons/t05-c01.json'
import t05c02 from '../../content/lessons/t05-c02.json'
import t05c03 from '../../content/lessons/t05-c03.json'
import t05c04 from '../../content/lessons/t05-c04.json'
import t06c01 from '../../content/lessons/t06-c01.json'
import t07c01 from '../../content/lessons/t07-c01.json'
import t07c02 from '../../content/lessons/t07-c02.json'
import t08c01 from '../../content/lessons/t08-c01.json'
import t08c02 from '../../content/lessons/t08-c02.json'
import t09c01 from '../../content/lessons/t09-c01.json'
import t09c02 from '../../content/lessons/t09-c02.json'
import t10c01 from '../../content/lessons/t10-c01.json'
import { SHOW_DRAFTS } from '../quiz/questions'
import type { Block, LessonFile, Sheet } from './types'

// Un import par chapitre (le test de publication vérifie qu'aucun fichier n'est oublié).
const ALL = [t01c01, t01c02, t01c03, t01c04, t01c05, t01c06, t02c01, t02c02, t03c01, t03c02, t03c03, t04c01, t04c02, t04c03, t04c04, t04c05, t05c01, t05c02, t05c03, t05c04, t06c01, t07c01, t07c02, t08c01, t08c02, t09c01, t09c02, t10c01] as LessonFile[]

// Même interrupteur que les questions (doc 43 §4)
export function getLessons(): LessonFile[] {
  return ALL.filter((l) => SHOW_DRAFTS || l.status === 'published')
}

export function getLesson(chapterId: string | null): LessonFile | undefined {
  return getLessons().find((l) => l.id === chapterId)
}

/** Ids de toutes les fiches, pour le compteur « x / y lues » de l'accueil. */
export function allSheetIds(): string[] {
  return getLessons().flatMap((l) => l.sheets.map((s) => s.id))
}

/** Chapitre seul (`n` absent) ou lecture de la fiche n (1-based). */
export function sheetHref(chapterId: string, n?: number): string {
  const base = `/fiches?c=${encodeURIComponent(chapterId)}`
  return n === undefined ? base : `${base}&f=${n}`
}

/** Paramètre `f` → numéro de fiche (1..count), sinon null : l'écran du chapitre s'affiche. */
export function parseSheetParam(f: string | null, count: number): number | null {
  if (f === null || !/^[1-9]\d*$/.test(f)) return null
  const n = Number(f)
  return n <= count ? n : null
}

function blockText(b: Block): string {
  switch (b.type) {
    case 'text':
    case 'heading':
    case 'attention':
    case 'memo':
      return b.text
    case 'list':
      return b.items.join(' ')
    case 'table':
      return [...b.head, ...b.rows.flatMap((r) => [r.label, r.text])].join(' ')
    case 'image':
      return b.caption ?? ''
  }
}

export function sheetWords(sheet: Sheet): number {
  return sheet.blocks
    .map(blockText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/** Durée affichée : mots / 200 arrondi au-dessus, 1 min minimum (doc 62 §3). */
export function sheetMinutes(sheet: Sheet): number {
  return Math.max(1, Math.ceil(sheetWords(sheet) / 200))
}
