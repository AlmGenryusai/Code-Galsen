'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  STORAGE_KEY,
  emptyProgress,
  parseProgress,
  withAnswer,
  withExam,
  withLesson,
  withSeries,
  type Progress,
} from './progress'

function load(): Progress {
  try {
    return parseProgress(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return emptyProgress()
  }
}

function save(p: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // stockage plein ou indisponible : la progression reste en mémoire
  }
}

/** Progression locale (localStorage). Lue après montage pour éviter un écart d'hydratation. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(emptyProgress)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProgress(load())
    setLoaded(true)
  }, [])

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(load())
    save(next)
    setProgress(next)
  }, [])

  const recordAnswer = useCallback(
    (questionId: string, isCorrect: boolean) =>
      update((p) => withAnswer(p, questionId, isCorrect, new Date())),
    [update],
  )

  const recordExam = useCallback(
    (r: { score: number; faults: number; total: number; passed: boolean }) => {
      const now = new Date()
      update((p) => withExam(p, { id: String(now.getTime()), date: now.toISOString(), ...r }))
    },
    [update],
  )

  const recordSeries = useCallback(
    (theme: string, score: number, total: number) =>
      update((p) => withSeries(p, theme, { score, total, date: new Date().toISOString() })),
    [update],
  )

  const recordLesson = useCallback(
    (chapter: string) => update((p) => withLesson(p, chapter, new Date())),
    [update],
  )

  return { progress, loaded, recordAnswer, recordExam, recordSeries, recordLesson }
}
