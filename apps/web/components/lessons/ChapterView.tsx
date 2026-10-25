'use client'

import Link from 'next/link'
import { LessonHeader } from './LessonHeader'
import { BottomBar, BOTTOM_BAR_SPACE } from './BottomBar'
import { useThemeAccess } from './useThemeAccess'
import { ChevronIcon } from '@/components/dashboard/Icons'
import { sheetHref, sheetMinutes } from '@/lib/lessons/lessons'
import type { LessonFile } from '@/lib/lessons/types'
import { useProgress } from '@/lib/progress/use-progress'
import { chapterTitle } from '@/lib/quiz/taxonomy'

/** Liste des fiches d'un chapitre. */
export function ChapterView({ lesson }: { lesson: LessonFile }) {
  const open = useThemeAccess(lesson.theme)
  const { progress } = useProgress()
  if (!open) return null
  const read = lesson.sheets.filter((s) => progress.lessons[s.id]).length

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title={chapterTitle(lesson.id)} backHref="/fiches" />
      <main style={{ padding: '12px 20px 0', paddingBottom: BOTTOM_BAR_SPACE }}>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted))' }}>
          {lesson.sheets.length} {lesson.sheets.length > 1 ? 'fiches' : 'fiche'} · {read} / {lesson.sheets.length} lues
        </p>
        {lesson.sheets.map((s, i) => (
          <Link
            key={s.id}
            href={sheetHref(lesson.id, i + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 64,
              padding: '10px 0',
              borderBottom: '1px solid hsl(var(--sand))',
              textDecoration: 'none',
              color: 'hsl(var(--ink))',
            }}
          >
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{s.title}</span>
              <span style={{ fontSize: 14, color: 'hsl(var(--muted))' }}>{sheetMinutes(s)} min</span>
            </span>
            {progress.lessons[s.id] && (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--structure))' }}>✓ Lue</span>
            )}
            <span aria-hidden style={{ color: 'hsl(var(--muted))', display: 'flex', flexShrink: 0 }}>
              <ChevronIcon />
            </span>
          </Link>
        ))}
      </main>
      <BottomBar href={`/quiz?theme=${encodeURIComponent(lesson.theme)}`}>M&apos;entraîner sur ce thème</BottomBar>
    </div>
  )
}
