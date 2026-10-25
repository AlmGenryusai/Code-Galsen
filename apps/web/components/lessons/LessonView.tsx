'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LessonHeader } from './LessonHeader'
import { LESSON_BLOCKS } from '@/lib/lessons/lessons'
import type { Lesson } from '@/lib/lessons/types'
import { redirectFor, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import { useProgress } from '@/lib/progress/use-progress'
import { chapterTitle } from '@/lib/quiz/taxonomy'

const BAR_HEIGHT = 72

/** Une fiche. Même verrou que les séries du thème (lib/license : cible `theme`). Marquée lue à l'ouverture. */
export function LessonView({ lesson }: { lesson: Lesson }) {
  const router = useRouter()
  const license = useLicense()
  const { loaded, recordLesson } = useProgress()
  const target: Target = { kind: 'theme', theme: lesson.theme }
  const redirect = license.loaded ? redirectFor(target, license) : null
  const open = license.loaded && !redirect

  useEffect(() => {
    if (redirect) router.replace(redirect)
  }, [redirect, router])

  useEffect(() => {
    if (open && loaded) recordLesson(lesson.id)
  }, [open, loaded, recordLesson, lesson.id])

  if (!open) return null

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title={chapterTitle(lesson.id)} backHref="/fiches" />

      <main
        style={{
          padding: '20px 20px 0',
          paddingBottom: `calc(${BAR_HEIGHT}px + env(safe-area-inset-bottom) + 24px)`,
          color: 'hsl(var(--ink))',
        }}
      >
        {LESSON_BLOCKS.map(({ key, title }) => (
          <section key={key} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6 }}>{lesson.blocks[key]}</p>
          </section>
        ))}
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          margin: '0 auto',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: 'hsl(var(--bg))',
          borderTop: '1px solid hsl(var(--sand))',
        }}
      >
        <Link
          href={`/quiz?theme=${encodeURIComponent(lesson.theme)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--ink))',
            borderRadius: 'var(--radius)',
            fontSize: 16,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          M&apos;entraîner sur ce thème
        </Link>
      </div>
    </div>
  )
}
