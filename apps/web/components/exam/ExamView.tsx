'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuizOption } from '@/components/quiz/QuizOption'
import type { Question } from '@/lib/quiz/mock-questions'

const TIMER_SECONDS = 20
const MAX_FAULTS = 5

interface ExamViewProps {
  questions: Question[]
}

type ExamResult = 'pass' | 'fail'

export function ExamView({ questions }: ExamViewProps) {
  const router = useRouter()
  const total = questions.length

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [faults, setFaults] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)

  const q = questions[index]
  const answered = selected !== null || timedOut
  const isLast = index + 1 >= total

  useEffect(() => {
    if (answered || result !== null) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      setFaults(f => f + 1)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, answered, result])

  function handleSelect(optionId: string) {
    if (answered) return
    setSelected(optionId)
    if (optionId !== q.correctId) {
      setFaults(f => f + 1)
    }
  }

  function handleNext() {
    if (isLast) {
      setResult(faults <= MAX_FAULTS ? 'pass' : 'fail')
    } else {
      setIndex(i => i + 1)
      setSelected(null)
      setTimedOut(false)
      setTimeLeft(TIMER_SECONDS)
    }
  }

  function optionState(optionId: string) {
    if (!answered) return 'idle' as const
    if (optionId === q.correctId) return 'correct' as const
    if (optionId === selected) return 'wrong' as const
    return 'disabled' as const
  }

  if (result !== null) {
    const correct = total - faults
    const pct = Math.max(0, Math.round((correct / total) * 100))
    const pass = result === 'pass'
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'hsl(var(--bg))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        gap: 16,
      }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: pass ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
          {pct}%
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'hsl(var(--text))' }}>
          {pass ? 'Examen réussi' : 'Examen échoué'}
        </div>
        <div style={{ fontSize: 14, color: 'hsl(var(--muted))', textAlign: 'center', lineHeight: 1.6 }}>
          {faults} faute{faults !== 1 ? 's' : ''} sur {MAX_FAULTS} autorisées
          <br />
          {Math.max(0, correct)}/{total} bonnes réponses
        </div>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button
            onClick={() => router.push('/examen')}
            style={{
              padding: '15px',
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--text))',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Recommencer
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '15px',
              background: 'transparent',
              color: 'hsl(var(--muted))',
              border: '1.5px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Retour au parcours
          </button>
        </div>
      </div>
    )
  }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column' }}>
      {/* Timer bar — discret, haut d'écran */}
      <div style={{ height: 3, background: 'hsl(var(--border))', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${answered ? timerPct : timerPct}%`,
          background: 'hsl(var(--primary))',
          transition: answered ? 'none' : 'width 1s linear',
        }} />
      </div>

      {/* Header : compteur + dots fautes */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          color: 'hsl(var(--muted))',
        }}>
          Q {index + 1} / {total}
        </div>

        {/* Fault dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: MAX_FAULTS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i < faults ? 'hsl(var(--error))' : 'hsl(var(--border))',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Question + options */}
      <div style={{ flex: 1, padding: '4px 20px 20px', display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'hsl(var(--text))',
          marginBottom: 20,
        }}>
          {q.text}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(opt => (
            <QuizOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              state={optionState(opt.id)}
              onSelect={() => handleSelect(opt.id)}
            />
          ))}
        </div>

        {answered && (
          <div style={{ marginTop: 16 }}>
            {timedOut && (
              <div style={{
                padding: '10px 14px',
                background: 'hsl(var(--error-soft))',
                border: '1px solid hsl(var(--error))',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontWeight: 600,
                color: 'hsl(var(--error))',
                marginBottom: 10,
              }}>
                Temps écoulé
              </div>
            )}
            <div style={{
              padding: '12px 14px',
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'hsl(var(--muted))',
              marginBottom: 12,
            }}>
              {q.explanation}
            </div>
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px',
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--text))',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Voir les résultats' : 'Question suivante →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
