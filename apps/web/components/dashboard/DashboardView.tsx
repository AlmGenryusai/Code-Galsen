'use client'

import { PassChip } from './PassChip'
import { HomeCard } from './HomeCard'
import { ReviewChip } from './ReviewChip'
import { ThemeRow } from './ThemeRow'
import { BottomNav } from './BottomNav'
import { ExamIcon, SeriesIcon, SheetsIcon, TrainingIcon } from './Icons'
import { themeProgress, type QuestionRef } from '@/lib/progress/progress'
import { useProgress } from '@/lib/progress/use-progress'
import { countDue } from '@/lib/quiz/srs'
import { seriesCardSize } from '@/lib/quiz/series'
import { canAccess, hrefFor, targetHref, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'

export interface DashboardData {
  themes: Array<{
    id: string
    title: string
    questionsTotal: number
  }>
}

interface Props {
  data: DashboardData
  questions: QuestionRef[]
  lessonIds: string[]
}

export function DashboardView({ data, questions, lessonIds }: Props) {
  const { progress, loaded } = useProgress()
  const license = useLicense()
  // Avant chargement : lien vers la cible, sans cadenas ; la page cible tranche
  const ready = loaded && license.loaded
  const href = (t: Target) => (ready ? hrefFor(t, license) : targetHref(t))
  const locked = (t: Target) => ready && !canAccess(t, license)
  const byTheme = themeProgress(progress, questions)
  // Avant chargement de la licence : thème gratuit seul (comme les cadenas)
  const seriesSize = seriesCardSize(
    data.themes
      .filter((t) => canAccess({ kind: 'theme', theme: t.id }, ready ? license : { active: false, expiresAt: null }))
      .map((t) => t.questionsTotal),
  )
  const lastExam = progress.exams[0]
  const examTarget: Target = { kind: 'exam', examsTaken: progress.exams.length }
  // ids inconnus (anciennes questions) ignorés
  const knownIds = new Set(questions.map((q) => q.id))
  const srsCountDue = countDue(Object.values(progress.srs).filter((s) => knownIds.has(s.questionId)))
  // ids inconnus (anciennes fiches) ignorés
  const lessonsRead = lessonIds.filter((id) => progress.lessons[id]).length
  const answersCount = Object.values(progress.answers).reduce((s, a) => s + a.correct + a.wrong, 0)

  return (
    <div style={{ background: 'hsl(var(--bg))', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}>
      <header
        style={{
          background: 'hsl(var(--structure))',
          color: 'hsl(var(--bg))',
          minHeight: 52,
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800 }}>Code Galsen</span>
        {license.loaded && <PassChip license={license} />}
      </header>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: 'hsl(var(--ink))' }}>Bonjour.</h1>
          {answersCount === 0 && (
            <p style={{ fontSize: 16, color: 'hsl(var(--muted))', marginTop: 4 }}>Choisis un thème pour commencer.</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <HomeCard icon={<SeriesIcon />} title="Séries thématiques" note={seriesSize > 0 ? `${seriesSize} question${seriesSize > 1 ? 's' : ''}` : undefined} href="#themes" />
          <HomeCard
            icon={<TrainingIcon />}
            title="Entraînement"
            note="Toutes les questions"
            href={href({ kind: 'all' })}
            locked={locked({ kind: 'all' })}
          />
          <HomeCard
            icon={<ExamIcon />}
            title="Examen blanc"
            note={lastExam ? `Dernier : ${lastExam.total - lastExam.faults} / ${lastExam.total}` : undefined}
            href={href(examTarget)}
            locked={locked(examTarget)}
          />
          <HomeCard
            icon={<SheetsIcon />}
            title="Fiches de cours"
            note={`${lessonsRead} / ${lessonIds.length} lues`}
            href="/fiches"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <HomeCard icon={<SheetsIcon />} title="Panneaux" note="Par famille" href="/panneaux" />
          </div>
        </div>

        <ReviewChip count={srsCountDue} href={href({ kind: 'errors' })} locked={locked({ kind: 'errors' })} />

        <section id="themes" style={{ scrollMarginTop: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'hsl(var(--ink))', margin: '8px 0 4px' }}>
            Séries thématiques
          </h2>
          {data.themes.map((t) => (
            <ThemeRow
              key={t.id}
              title={t.title}
              progress={byTheme[t.id] ?? 0}
              questionsTotal={t.questionsTotal}
              lastSeries={progress.series[t.id]}
              href={href({ kind: 'theme', theme: t.id })}
              locked={locked({ kind: 'theme', theme: t.id })}
            />
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
