'use client'

import { PassChip } from './PassChip'
import { ExamScoreCard } from './ExamScoreCard'
import { ReviewChip } from './ReviewChip'
import { StreakChip } from './StreakChip'
import { ProgressCircle } from './ProgressCircle'
import { ThemeRow } from './ThemeRow'
import { BottomNav } from './BottomNav'

export interface DashboardData {
  userName: string
  passExpiresAt: number
  globalProgressPct: number
  cumulatedMinutes: number
  examBlancReussis: number
  srsCountDue: number
  examScore: number | null
  streakDays: number
  themes: Array<{
    id: string
    icon: string
    color: string
    title: string
    progress: number
    questionsTotal: number
  }>
}

interface Props {
  data: DashboardData
}

export function DashboardView({ data }: Props) {
  const isFirstDay = data.streakDays === 0 && data.globalProgressPct === 0

  const sublabel = `${Math.floor(data.cumulatedMinutes / 60)} h cumulées · ${data.examBlancReussis} examen${data.examBlancReussis > 1 ? 's' : ''} blanc réussi${data.examBlancReussis > 1 ? 's' : ''}`

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px 12px',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'hsl(var(--text))' }}>Mon parcours</span>
        <PassChip passExpiresAt={data.passExpiresAt} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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

        {/* ExamScore — héros plein-largeur (P02) */}
        <ExamScoreCard score={data.examScore} />

        {/* Chips secondaires (P02) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ReviewChip count={data.srsCountDue} />
          <StreakChip days={data.streakDays} />
        </div>

        {/* Progression globale */}
        <ProgressCircle
          percent={data.globalProgressPct}
          size={36}
          label="Progression globale"
          value={String(data.globalProgressPct)}
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
            <a href="/themes" style={{
              fontSize: 12,
              color: 'hsl(var(--primary-h))',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}>
              Voir tout
            </a>
          </div>

          {/* P08 — gradient fade signal scroll */}
          <div style={{ position: 'relative' }}>
            {data.themes.map((t) => (
              <ThemeRow
                key={t.id}
                icon={t.icon}
                color={t.color}
                title={t.title}
                progress={t.progress}
                questionsTotal={t.questionsTotal}
                href={`/themes/${t.id}`}
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
