'use client'

import { useEffect } from 'react'
import { LessonHeader } from './LessonHeader'
import { BottomBar, BOTTOM_BAR_SPACE } from './BottomBar'
import { ProgressBar } from './ProgressBar'
import { SheetBlocks } from './SheetBlocks'
import { useThemeAccess } from './useThemeAccess'
import { sheetHref, sheetMinutes } from '@/lib/lessons/lessons'
import type { LessonFile } from '@/lib/lessons/types'
import { useProgress } from '@/lib/progress/use-progress'
import { chapterTitle } from '@/lib/quiz/taxonomy'

/** Lecture de la fiche n (1-based). Marquée lue à l'ouverture, si l'accès est autorisé. */
export function SheetView({ lesson, n }: { lesson: LessonFile; n: number }) {
  const open = useThemeAccess(lesson.theme)
  const { loaded, recordLesson } = useProgress()
  const sheet = lesson.sheets[n - 1]
  const total = lesson.sheets.length
  const last = n === total

  useEffect(() => {
    if (open && loaded) recordLesson(sheet.id)
  }, [open, loaded, recordLesson, sheet.id])

  if (!open) return null

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title={chapterTitle(lesson.id)} backHref={sheetHref(lesson.id)} />
      <main style={{ padding: '16px 20px 0', paddingBottom: BOTTOM_BAR_SPACE, color: 'hsl(var(--ink))' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: 6 }}>
          Fiche {n}/{total}
        </p>
        <ProgressBar value={n} max={total} label={`Fiche ${n} sur ${total}`} />
        <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, margin: '16px 0 2px' }}>{sheet.title}</h1>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginBottom: 4 }}>{sheetMinutes(sheet)} min</p>
        <SheetBlocks sheet={sheet} />
      </main>
      {last ? (
        <BottomBar
          href={`/quiz?theme=${encodeURIComponent(lesson.theme)}`}
          secondary={{ href: '/', label: "Retour à l'accueil" }}
        >
          M&apos;entraîner sur ce thème
        </BottomBar>
      ) : (
        <BottomBar href={sheetHref(lesson.id, n + 1)}>Suivant</BottomBar>
      )}
    </div>
  )
}
