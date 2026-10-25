'use client'

import Link from 'next/link'
import { PassChip } from './PassChip'
import { ExamScoreCard } from './ExamScoreCard'
import { ReviewChip } from './ReviewChip'
import { ProgressCircle } from './ProgressCircle'
import { ThemeRow } from './ThemeRow'
import { BottomNav } from './BottomNav'
import { themeProgress, type QuestionRef } from '@/lib/progress/progress'
import { useProgress } from '@/lib/progress/use-progress'
import { countDue } from '@/lib/quiz/srs'
import { canAccess, hrefFor, targetHref, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'

export interface DashboardData {
  themes: Array<{
    id: string
    icon: string
    color: string
    title: string
    questionsTotal: number
  }>
}

interface Props {
  data: DashboardData
  questions: QuestionRef[]
}

export function DashboardView({ data, questions }: Props) {
  const { progress, loaded } = useProgress()
  const license = useLicense()
  // Avant chargement : lien vers la cible, sans cadenas ; la page cible tranche
  const ready = loaded && license.loaded
  const href = (t: Target) => (ready ? hrefFor(t, license) : targetHref(t))
  const locked = (t: Target) => ready && !canAccess(t, license)
  const byTheme = themeProgress(progress, questions)
  const totalQuestions = data.themes.reduce((s, t) => s + t.questionsTotal, 0)
  const globalProgressPct = totalQuestions > 0
    ? Math.round(data.themes.reduce((s, t) => s + (byTheme[t.id] ?? 0) * t.questionsTotal, 0) / totalQuestions)
    : 0
  const examScore = progress.exams[0]?.score ?? null
  const examsTaken = progress.exams.length
  const srsCountDue = countDue(Object.values(progress.srs))
  const answersCount = Object.values(progress.answers).reduce((s, a) => s + a.correct + a.wrong, 0)

  const sublabel = `${answersCount} question${answersCount > 1 ? 's' : ''} répondue${answersCount > 1 ? 's' : ''} · ${examsTaken} examen${examsTaken > 1 ? 's' : ''} blanc${examsTaken > 1 ? 's' : ''} fait${examsTaken > 1 ? 's' : ''}`

  return (
    <div style={{ background: 'hsl(var(--bg))', paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px 8px',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'hsl(var(--text))' }}>Mon parcours</span>
        {license.loaded && <PassChip license={license} />}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: 'hsl(var(--text))' }}>
            Bonjour.
          </h1>
          {answersCount === 0 && (
            <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 4 }}>
              Choisis un thème pour commencer.
            </p>
          )}
        </div>

        {/* ExamScore — tap → /examen */}
        <ExamScoreCard score={examScore} href={href({ kind: 'exam', examsTaken: progress.exams.length })} />

        {/* Chips secondaires (P02) */}
        <ReviewChip count={srsCountDue} href={href({ kind: 'errors' })} />

        {/* Progression globale */}
        <ProgressCircle
          percent={globalProgressPct}
          size={36}
          label="Progression globale"
          value={String(globalProgressPct)}
          sublabel={sublabel}
        />

        {/* Thèmes du programme */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--muted))' }}>Thèmes du programme</span>
            <Link href={href({ kind: 'all' })} style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'hsl(var(--muted))',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}>
              Voir tout
            </Link>
          </div>

          {/* P08 — gradient fade signal scroll */}
          <div style={{ position: 'relative' }}>
            {data.themes.map((t) => (
              <ThemeRow
                key={t.id}
                icon={t.icon}
                color={t.color}
                title={t.title}
                progress={byTheme[t.id] ?? 0}
                questionsTotal={t.questionsTotal}
                href={href({ kind: 'theme', theme: t.id })}
                locked={locked({ kind: 'theme', theme: t.id })}
              />
            ))}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 32,
              background: 'linear-gradient(to bottom, transparent, hsl(var(--bg)))',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
