'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CorrectionSheet } from './CorrectionSheet'
import { scoreByTheme, stepCorrection, targetScore } from '@/lib/quiz/exam'
import { themeTitle } from '@/lib/quiz/taxonomy'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

export interface ExamAnswer {
  picked: OptionId[][]
  correct: boolean
  timedOut: boolean
  orders?: OptionId[][] // ordre affiché des options ; absent = ordre du JSON
}

interface ExamDebriefProps {
  questions: QuestionV2[]
  answers: ExamAnswer[] // même ordre que `questions`
}

const SAFE_BOTTOM = 'calc(24px + env(safe-area-inset-bottom))'

const headerStyle = {
  background: 'hsl(var(--structure))',
  color: 'hsl(var(--bg))',
  padding: '0 16px',
  minHeight: 52,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const

const primaryButton = {
  minHeight: 48,
  width: '100%',
  background: 'hsl(var(--primary))',
  color: 'hsl(var(--ink))',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: 16,
  fontWeight: 700,
  fontFamily: 'var(--font-sans)',
} as const

function Gauge({ correct, total }: { correct: number; total: number }) {
  const r = 54
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--sand))" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--structure))" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - (total ? correct / total : 0))}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'hsl(var(--ink))' }}>
        {correct} / {total}
      </div>
    </div>
  )
}

export function ExamDebrief({ questions, answers }: ExamDebriefProps) {
  const router = useRouter()
  const [open, setOpen] = useState<number | null>(null)

  const total = questions.length
  const correct = answers.filter((a) => a.correct).length
  const themes = scoreByTheme(questions.map((q, i) => ({ theme: q.theme, correct: answers[i].correct })))

  if (open !== null) {
    return (
      <CorrectionSheet
        questions={questions}
        answers={answers}
        index={open}
        onStep={(dir) => setOpen(stepCorrection(open, total, dir))}
        onClose={() => setOpen(null)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <div style={headerStyle}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Examen blanc terminé</div>
      </div>

      <div style={{ maxWidth: 430, margin: '0 auto', padding: `24px 20px ${SAFE_BOTTOM}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Gauge correct={correct} total={total} />
          <div style={{ fontSize: 15, color: 'hsl(var(--ink))' }}>Objectif : {targetScore(total)} / {total}</div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(var(--ink))', margin: '28px 0 12px' }}>Par thème</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {themes.map((t) => (
            <li key={t.theme}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15, color: 'hsl(var(--ink))' }}>
                <span>{themeTitle(t.theme)}</span>
                <span style={{ fontWeight: 700 }}>{t.correct} / {t.total}</span>
              </div>
              <div style={{ height: 6, marginTop: 6, borderRadius: 3, background: 'hsl(var(--sand))' }}>
                <div style={{ height: '100%', width: `${(t.correct / t.total) * 100}%`, borderRadius: 3, background: 'hsl(var(--structure))' }} />
              </div>
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'hsl(var(--ink))', margin: '28px 0 4px' }}>Tes réponses</h2>
        <p style={{ fontSize: 14, color: 'hsl(var(--ink))', margin: '0 0 12px' }}>Touche une question pour voir la correction.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 8 }}>
          {answers.map((a, i) => (
            <button
              key={questions[i].id}
              onClick={() => setOpen(i)}
              aria-label={`Question ${i + 1}, ${a.correct ? 'juste' : 'fausse'}`}
              style={{
                minHeight: 52,
                borderRadius: 8,
                border: 'none',
                background: a.correct ? 'hsl(var(--right-soft))' : 'hsl(var(--wrong-soft))',
                color: a.correct ? 'hsl(var(--right))' : 'hsl(var(--wrong))',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.2,
              }}
            >
              {i + 1}
              <span aria-hidden="true" style={{ fontSize: 12 }}>{a.correct ? '✓' : '✕'}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
          {correct < total && (
            <button onClick={() => router.push('/quiz?mode=erreurs')} style={primaryButton}>Revoir mes erreurs</button>
          )}
          <button
            onClick={() => router.push('/')}
            style={{ ...primaryButton, background: 'transparent', color: 'hsl(var(--ink))', border: '1.5px solid hsl(var(--sand))' }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  )
}
