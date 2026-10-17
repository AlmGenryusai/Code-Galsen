'use client'

import Link from 'next/link'
import { PassChip } from './PassChip'
import { ExamScoreCard } from './ExamScoreCard'
import { ReviewChip } from './ReviewChip'
import { StreakChip } from './StreakChip'
import { ProgressCircle } from './ProgressCircle'
import { ThemeRow } from './ThemeRow'
import { BottomNav } from './BottomNav'
import { themeProgress, type QuestionRef } from '@/lib/progress/progress'
import { useProgress } from '@/lib/progress/use-progress'

export interface DashboardData {
  userName: string
  passExpiresAt: number
  cumulatedMinutes: number
  srsCountDue: number
  streakDays: number
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
  const { progress } = useProgress()
  const byTheme = themeProgress(progress, questions)
  const totalQuestions = data.themes.reduce((s, t) => s + t.questionsTotal, 0)
  const globalProgressPct = totalQuestions > 0
    ? Math.round(data.themes.reduce((s, t) => s + (byTheme[t.id] ?? 0) * t.questionsTotal, 0) / totalQuestions)
    : 0
  const examScore = progress.exams[0]?.score ?? null
  const examBlancReussis = progress.exams.filter(e => e.passed).length

  const isFirstDay = data.streakDays === 0 && globalProgressPct === 0

  const sublabel = `${Math.floor(data.cumulatedMinutes / 60)} h cumulées · ${examBlancReussis} examen${examBlancReussis > 1 ? 's' : ''} blanc${examBlancReussis > 1 ? 's' : ''} réussi${examBlancReussis > 1 ? 's' : ''}`

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
        <PassChip passExpiresAt={data.passExpiresAt} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: 'hsl(var(--text))' }}>
            {isFirstDay ? 'Premier jour.' : `Bonjour, ${data.userName}.`}
          </h1>
          {isFirstDay && (
            <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 4 }}>
              Choisis un thème pour commencer.
            </p>
          )}
        </div>

        {/* ExamScore — tap → /examen */}
        <ExamScoreCard score={examScore} href="/examen" />

        {/* Chips secondaires (P02) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ReviewChip count={data.srsCountDue} />
          <StreakChip days={data.streakDays} />
        </div>

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
            <Link href="/quiz" style={{
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
                href="/quiz"
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
