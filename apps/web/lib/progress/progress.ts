// Progression locale — stockée dans localStorage sous une seule clé
// Fonctions pures : aucun accès à window ici (voir use-progress.ts)

import type { Question } from '../quiz/types'
import { DEFAULT_SRS_CONFIG, initSrs, review, type SrsState } from '../quiz/srs'

export const STORAGE_KEY = 'galsen.progress.v1'

export interface AnswerStat {
  correct: number
  wrong: number
  lastAnsweredAt: string // ISO 8601
}

export interface ExamAttempt {
  id: string
  date: string        // ISO 8601
  score: number       // pourcentage 0-100
  faults: number
  total: number
  passed: boolean
}

export interface Progress {
  answers: Record<string, AnswerStat> // clé = id de question
  exams: ExamAttempt[]                // plus récent en tête
  srs: Record<string, SrsState>       // file « mes erreurs », clé = id de question
}

export interface WeakTheme {
  themeId: string
  label: string
  errorRate: number         // 0.0–1.0
  questionsAttempted: number
}

export type QuestionRef = Pick<Question, 'id' | 'theme'>

export function emptyProgress(): Progress {
  return { answers: {}, exams: [], srs: {} }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Relit la progression ; null, JSON invalide ou forme inattendue → progression vide. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress()
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return emptyProgress()
  }
  if (!isObject(data) || !isObject(data.answers) || !Array.isArray(data.exams)) {
    return emptyProgress()
  }
  return {
    answers: data.answers as Progress['answers'],
    exams: data.exams as ExamAttempt[],
    // progression enregistrée avant la file SRS : pas de champ srs
    srs: isObject(data.srs) ? (data.srs as Progress['srs']) : {},
  }
}

function nextSrs(srs: Progress['srs'], questionId: string, isCorrect: boolean, now: Date): Progress['srs'] {
  const state = srs[questionId]
  if (state) {
    const next = review(state, isCorrect, DEFAULT_SRS_CONFIG, now)
    const rest = { ...srs }
    delete rest[questionId]
    return next ? { ...rest, [questionId]: next } : rest
  }
  if (isCorrect) return srs
  // première erreur : à réviser tout de suite
  return { ...srs, [questionId]: { ...initSrs(questionId, DEFAULT_SRS_CONFIG, now), nextReviewAt: now.toISOString() } }
}

/** Enregistre une réponse : compteurs + file SRS. */
export function withAnswer(p: Progress, questionId: string, isCorrect: boolean, now: Date): Progress {
  const prev = p.answers[questionId] ?? { correct: 0, wrong: 0, lastAnsweredAt: '' }
  return {
    ...p,
    srs: nextSrs(p.srs, questionId, isCorrect, now),
    answers: {
      ...p.answers,
      [questionId]: {
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        lastAnsweredAt: now.toISOString(),
      },
    },
  }
}

export function withExam(p: Progress, attempt: ExamAttempt): Progress {
  return { ...p, exams: [attempt, ...p.exams] }
}

/** Taux d'erreur par thème (Σ fautes / Σ réponses), thèmes avec au moins une réponse, du plus faible au plus fort. */
export function themeErrorRates(p: Progress, questions: QuestionRef[]): WeakTheme[] {
  const byTheme = new Map<string, { wrong: number; total: number; attempted: number }>()
  for (const q of questions) {
    const a = p.answers[q.id]
    if (!a || a.correct + a.wrong === 0) continue
    const t = byTheme.get(q.theme) ?? { wrong: 0, total: 0, attempted: 0 }
    t.wrong += a.wrong
    t.total += a.correct + a.wrong
    t.attempted += 1
    byTheme.set(q.theme, t)
  }
  return Array.from(byTheme, ([theme, t]) => ({
    themeId: theme,
    label: theme,
    errorRate: t.wrong / t.total,
    questionsAttempted: t.attempted,
  })).sort((a, b) => b.errorRate - a.errorRate)
}

/** % (0-100) des questions de chaque thème déjà réussies au moins une fois. */
export function themeProgress(p: Progress, questions: QuestionRef[]): Record<string, number> {
  const counts = new Map<string, { done: number; total: number }>()
  for (const q of questions) {
    const c = counts.get(q.theme) ?? { done: 0, total: 0 }
    c.total += 1
    if ((p.answers[q.id]?.correct ?? 0) > 0) c.done += 1
    counts.set(q.theme, c)
  }
  const result: Record<string, number> = {}
  for (const [theme, c] of counts) result[theme] = Math.round((c.done / c.total) * 100)
  return result
}
