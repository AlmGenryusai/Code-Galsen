// Tirage d'une série thématique — fonction pure
import type { QuestionV2 } from './types'

export const SERIES_SIZE = 10

/** Jusqu'à `size` questions du thème, au hasard et sans doublon. */
export function pickSeries(
  pool: QuestionV2[],
  theme: string,
  size: number = SERIES_SIZE,
  rng: () => number = Math.random,
): QuestionV2[] {
  const a = pool.filter((q) => q.theme === theme)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, size)
}

/** Taille réelle d'une série : 10 au plus, jamais plus que le plus grand thème proposé. */
export function seriesCardSize(counts: number[]): number {
  return Math.min(SERIES_SIZE, Math.max(0, ...counts))
}
