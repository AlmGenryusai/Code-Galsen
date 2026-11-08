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
export function LessonList({ lessons, openTheme }: { lessons: LessonFile[]; openTheme?: string | null }) {
  const license = useLicense()
  const { progress } = useProgress()
  // Thème gratuit en tête, puis l'ordre de la taxonomie
  const themes = TAXONOMY.filter((t) => lessons.some((l) => l.theme === t.id)).sort(
    (a, b) => Number(b.id === FREE_THEME) - Number(a.id === FREE_THEME),
  )

  // Thème déplié : celui d'où l'on vient, sinon le premier dont tous les chapitres ne sont pas lus
  const unfinished = themes.find((t) =>
    lessons.some((l) => l.theme === t.id && !l.sheets.every((sh) => progress.lessons[sh.id])),
  )
  const opened = themes.some((t) => t.id === openTheme) ? openTheme : (unfinished ?? themes[0])?.id

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title="Fiches de cours" backHref="/" />
      <main style={{ padding: '8px 20px 24px' }}>
        {themes.map((t) => {
          const chapters = lessons.filter((l) => l.theme === t.id)
          // Étapes du thème : chaque chapitre lu en entier + la série d'entraînement du thème
          const done =
            chapters.filter((l) => l.sheets.every((sh) => progress.lessons[sh.id])).length +
            (progress.series[t.id] ? 1 : 0)
          const steps = chapters.length + 1
          const themeLocked = license.loaded && !canAccess({ kind: 'theme', theme: t.id }, license)
          return (
          <details key={t.id} open={t.id === opened} style={{ borderBottom: '1px solid hsl(var(--sand))' }}>
            <summary
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                padding: '12px 0',
                cursor: 'pointer',
                listStyle: 'none',
              }}
            >
              <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: 'hsl(var(--ink))' }}>
                {themeTitle(t.id)}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: done === steps ? 'hsl(var(--structure))' : 'hsl(var(--muted))' }}>
                {themeLocked ? <LockIcon /> : done === steps ? 'Terminé ✓' : `${done}/${steps}`}
              </span>
            </summary>
            {chapters.map((l) => {
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
            <Link
              href={themeLocked ? ACTIVATE_HREF : `/quiz?theme=${encodeURIComponent(t.id)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 56,
                padding: '12px 0',
                textDecoration: 'none',
                color: 'hsl(var(--ink))',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span style={{ flex: 1 }}>
                Série du thème {progress.series[t.id] ? `· ${progress.series[t.id].score}/${progress.series[t.id].total}` : '· à faire'}
              </span>
              <span aria-hidden style={{ color: 'hsl(var(--muted))', display: 'flex' }}>
                <ChevronIcon />
              </span>
            </Link>
          </details>
          )
        })}
      </main>
    </div>
  )
}
