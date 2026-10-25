// Tirage et score de l'examen blanc — fonctions pures
import { EXAM_CONFIG } from './exam-config'
import { TAXONOMY } from './taxonomy'
import type { QuestionV2 } from './types'

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Tire `count` questions, réparties par thème proportionnellement au volume (doc 42 point 4).
 * Si le pool en contient moins, on prend tout. Ordre final mélangé.
 */
export function pickExamQuestions(
  pool: QuestionV2[],
  count: number = EXAM_CONFIG.questionCount,
  rng: () => number = Math.random,
): QuestionV2[] {
  if (pool.length <= count) return shuffle(pool, rng)

  const byTheme = new Map<string, QuestionV2[]>()
  for (const q of pool) byTheme.set(q.theme, [...(byTheme.get(q.theme) ?? []), q])

  // Plus fort reste : chaque thème a au moins floor(count × part), le reste va aux plus grandes décimales.
  const shares = Array.from(byTheme, ([theme, qs]) => {
    const exact = (count * qs.length) / pool.length
    return { theme, quota: Math.floor(exact), frac: exact - Math.floor(exact) }
  })
  let left = count - shares.reduce((n, s) => n + s.quota, 0)
  for (const s of [...shares].sort((a, b) => b.frac - a.frac)) {
    if (left <= 0) break
    s.quota += 1
    left -= 1
  }

  const picked = shares.flatMap((s) => shuffle(byTheme.get(s.theme) ?? [], rng).slice(0, s.quota))
  return shuffle(picked, rng)
}

export interface ThemeScore {
  theme: string
  correct: number
  total: number
}

/** Score par thème, dans l'ordre de la taxonomie. Thèmes sans question absents. */
export function scoreByTheme(items: { theme: string; correct: boolean }[]): ThemeScore[] {
  const map = new Map<string, ThemeScore>()
  for (const it of items) {
    const s = map.get(it.theme) ?? { theme: it.theme, correct: 0, total: 0 }
    s.total += 1
    if (it.correct) s.correct += 1
    map.set(it.theme, s)
  }
  const rank = (id: string) => {
    const i = TAXONOMY.findIndex((t) => t.id === id)
    return i === -1 ? TAXONOMY.length : i
  }
  return Array.from(map.values()).sort((a, b) => rank(a.theme) - rank(b.theme))
}

/** Nombre de bonnes réponses visé pour `total` questions (arrondi au-dessus). */
export function targetScore(total: number): number {
  return Math.ceil((total * EXAM_CONFIG.passThresholdPct) / 100)
}
