import { getLessons } from './lessons/lessons'
import { getQuestions } from './quiz/questions'
import type { Media } from './quiz/types'

export interface PhotoCredit {
  src: string
  alt: string
  credit: string
}

/** Photos utilisées dans les questions et les fiches publiées, une seule fois par fichier. */
export function getPhotoCredits(): PhotoCredit[] {
  const medias: Media[] = []
  for (const q of getQuestions()) if (q.media) medias.push(q.media)
  for (const l of getLessons())
    for (const s of l.sheets)
      for (const b of s.blocks) {
        if (b.type === 'image') medias.push(b.media)
        else if (b.type === 'signs') for (const i of b.items) medias.push(i.media)
        else if (b.type === 'table') for (const r of b.rows) if (r.media) medias.push(r.media)
      }
  const bySrc = new Map<string, PhotoCredit>()
  for (const m of medias) {
    if (m.kind !== 'photo' || bySrc.has(m.src)) continue
    bySrc.set(m.src, { src: m.src, alt: m.alt, credit: m.credit })
  }
  return [...bySrc.values()].sort((a, b) => a.src.localeCompare(b.src, 'fr', { numeric: true }))
}
