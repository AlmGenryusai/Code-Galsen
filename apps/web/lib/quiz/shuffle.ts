// Mélange déterministe des options (graine = id de la question + n° de partie) :
// même ordre à chaque affichage et à la correction, sans rien stocker.
import type { OptionId, QuestionV2 } from './types'

function seed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(s: number): () => number {
  let a = s
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ordre affiché des ids de chaque partie. OUI/NON et `shuffle: false` gardent l'ordre du JSON. */
export function orderFor(q: QuestionV2): OptionId[][] {
  return q.parts.map((part, pi) => {
    if (part.kind === 'yesno') return []
    const ids = part.options.map((o) => o.id)
    if (part.shuffle === false) return ids
    const r = rng(seed(`${q.id}:${pi}`))
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    return ids
  })
}
