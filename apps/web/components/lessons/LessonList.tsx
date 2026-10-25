'use client'

import Link from 'next/link'
import { LessonHeader } from './LessonHeader'
import { ChevronIcon, LockIcon } from '@/components/dashboard/Icons'
import { ProgressBar } from './ProgressBar'
import { sheetHref } from '@/lib/lessons/lessons'
import type { LessonFile } from '@/lib/lessons/types'
import { ACTIVATE_HREF, FREE_THEME, canAccess } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import { useProgress } from '@/lib/progress/use-progress'
import { TAXONOMY, chapterTitle, themeTitle } from '@/lib/quiz/taxonomy'

/** Une section par thème qui a des fiches, une ligne par chapitre. */
export function LessonList({ lessons }: { lessons: LessonFile[] }) {
  const license = useLicense()
  const { progress } = useProgress()
  // Thème gratuit en tête, puis l'ordre de la taxonomie
  const themes = TAXONOMY.filter((t) => lessons.some((l) => l.theme === t.id)).sort(
    (a, b) => Number(b.id === FREE_THEME) - Number(a.id === FREE_THEME),
  )

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
                const total = l.sheets.length
                const read = l.sheets.filter((sh) => progress.lessons[sh.id]).length
                return (
                  <Link
                    key={l.id}
                    href={locked ? ACTIVATE_HREF : sheetHref(l.id)}
                    aria-label={locked ? `${chapterTitle(l.id)} (verrouillé)` : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      minHeight: 72,
                      padding: '12px 0',
                      borderBottom: '1px solid hsl(var(--sand))',
                      textDecoration: 'none',
                      color: 'hsl(var(--ink))',
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
                        {chapterTitle(l.id)}
                      </span>
                      <span style={{ display: 'block', fontSize: 14, color: 'hsl(var(--muted))', margin: '2px 0 6px' }}>
                        {total} {total > 1 ? 'fiches' : 'fiche'}
                        {!locked && ` · ${read} / ${total} lues`}
                      </span>
                      {!locked && <ProgressBar value={read} max={total} label={`${read} fiches lues sur ${total}`} />}
                    </span>
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
