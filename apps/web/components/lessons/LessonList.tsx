'use client'

import Link from 'next/link'
import { LessonHeader } from './LessonHeader'
import { ChevronIcon, LockIcon } from '@/components/dashboard/Icons'
import { lessonHref } from '@/lib/lessons/lessons'
import type { Lesson } from '@/lib/lessons/types'
import { ACTIVATE_HREF, canAccess } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import { useProgress } from '@/lib/progress/use-progress'
import { TAXONOMY, chapterTitle, themeTitle } from '@/lib/quiz/taxonomy'

/** Une section par thème qui a des fiches, une ligne par chapitre. */
export function LessonList({ lessons }: { lessons: Lesson[] }) {
  const license = useLicense()
  const { progress } = useProgress()
  const themes = TAXONOMY.filter((t) => lessons.some((l) => l.theme === t.id))

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title="Fiches de cours" backHref="/" />
      <main style={{ padding: '8px 20px 24px' }}>
        {themes.map((t) => (
          <section key={t.id}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'hsl(var(--ink))', margin: '20px 0 4px' }}>
              {themeTitle(t.id)}
            </h2>
            {lessons
              .filter((l) => l.theme === t.id)
              .map((l) => {
                // Avant chargement de la licence : lien vers la fiche, sans cadenas ; la fiche tranche
                const locked = license.loaded && !canAccess({ kind: 'theme', theme: l.theme }, license)
                const read = Boolean(progress.lessons[l.id])
                return (
                  <Link
                    key={l.id}
                    href={locked ? ACTIVATE_HREF : lessonHref(l.id)}
                    aria-label={locked ? `${chapterTitle(l.id)} (verrouillé)` : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      minHeight: 56,
                      padding: '10px 0',
                      borderBottom: '1px solid hsl(var(--sand))',
                      textDecoration: 'none',
                      color: 'hsl(var(--ink))',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
                      {chapterTitle(l.id)}
                    </span>
                    {read && !locked && (
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--structure))' }}>Lue</span>
                    )}
                    <span aria-hidden style={{ color: 'hsl(var(--muted))', display: 'flex', flexShrink: 0 }}>
                      {locked ? <LockIcon /> : <ChevronIcon />}
                    </span>
                  </Link>
                )
              })}
          </section>
        ))}
      </main>
    </div>
  )
}
