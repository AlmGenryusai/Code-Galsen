'use client'

import { ProgressCircle } from './ProgressCircle'
import { ScoreCard } from './ScoreCard'
import { ThemeRow } from './ThemeRow'
import { BottomNav } from './BottomNav'

export interface DashboardData {
  userName: string
  passExpiresAt: number        // Unix timestamp
  globalProgressPct: number
  cumulatedMinutes: number
  examBlancReussis: number
  srsCountDue: number
  examScore: number | null      // null = pas encore d'examen
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

function daysLeft(exp: number): number {
  const ms = exp * 1000 - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function DashboardView({ data }: Props) {
  const days = daysLeft(data.passExpiresAt)
  const isPassUrgent = days < 7

  const sublabel = `${Math.floor(data.cumulatedMinutes / 60)} h cumulées · ${data.examBlancReussis} examen${data.examBlancReussis > 1 ? 's' : ''} blanc réussi${data.examBlancReussis > 1 ? 's' : ''}`

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 80 }}>
      {/* Status bar (cosmétique sur mobile) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 20px 6px',
        fontSize: 12,
        fontFamily: 'var(--mono)',
        opacity: 0.45,
      }}>
        <span>09:41</span>
        <span>5G · 86%</span>
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px 16px',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Mon parcours</span>
        <span style={{
          fontSize: 12,
          fontFamily: 'var(--mono)',
          padding: '4px 10px',
          borderRadius: 99,
          background: isPassUrgent ? 'var(--terra)' : 'var(--surface)',
          border: `1px solid ${isPassUrgent ? 'var(--terra)' : 'var(--stroke)'}`,
          color: isPassUrgent ? '#fff' : 'var(--text)',
        }}>
          Pass · {days}j
        </span>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            fontVariationSettings: '"opsz" 144, "SOFT" 30',
          }}>
            Bonjour,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>{data.userName}.</em>
          </h1>
        </div>

        {/* Progression globale (cercle) */}
        <ProgressCircle
          percent={data.globalProgressPct}
          size={36}
          label="Progression globale"
          value={String(data.globalProgressPct)}
          sublabel={sublabel}
        />

        {/* Quick grid — À réviser + ExamScore */}
        <div style={{ display: 'flex', gap: 10 }}>
          <ScoreCard
            value={data.srsCountDue}
            label="À réviser"
            href="/quiz?mode=srs"
          />
          <ScoreCard
            value={data.examScore ?? '—'}
            label="ExamScore"
            showPercent={data.examScore !== null}
            variant="accent"
            href="/quiz?mode=examen"
          />
        </div>

        {/* Thèmes du programme */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>Thèmes du programme</span>
            <a href="/themes" style={{
              fontSize: 12,
              color: 'var(--terra)',
              textDecoration: 'none',
              fontFamily: 'var(--mono)',
            }}>
              Voir tout
            </a>
          </div>

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
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
