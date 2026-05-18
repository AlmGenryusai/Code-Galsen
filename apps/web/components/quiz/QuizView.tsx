'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizOption } from './QuizOption'
import type { Question } from '@/lib/quiz/mock-questions'

interface QuizViewProps {
  questions: Question[]
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'disabled'

export function QuizView({ questions }: QuizViewProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const total = questions.length
  const answered = selected !== null

  function handleSelect(optionId: string) {
    if (answered) return
    setSelected(optionId)
    if (optionId === q.correctId) setScore(s => s + 1)
  }

  function handleNext() {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
    }
  }

  function optionState(optionId: string): OptionState {
    if (!answered) return 'idle'
    if (optionId === q.correctId) return 'correct'
    if (optionId === selected) return 'wrong'
    return 'disabled'
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    const pass = pct >= 80
    return (
      <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: 16 }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: pass ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
          {pct}%
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'hsl(var(--text))' }}>
          {pass ? 'Bravo ! Tu maîtrises ce thème.' : 'Continue à t\'entraîner.'}
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
          {score}/{total} bonnes réponses
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, marginTop: 8 }}>
          <button
            onClick={() => router.push('/examen')}
            style={{
              padding: '14px 32px',
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
            Passer un examen blanc →
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '14px 32px',
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

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', color: 'hsl(var(--muted))', fontSize: 20, lineHeight: 1 }}
          aria-label="Retour"
        >
          ‹
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }}>
          {index + 1} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ margin: '10px 20px 0', height: 4, background: 'hsl(var(--border))', borderRadius: 99 }}>
        <div style={{
          height: '100%',
          width: `${((index + (answered ? 1 : 0)) / total) * 100}%`,
          background: 'hsl(var(--primary))',
          borderRadius: 99,
        }} />
      </div>

      {/* Question */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        <p style={{
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'hsl(var(--text))',
          marginBottom: 20,
        }}>
          {q.text}
        </p>

        {/* Options */}
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

        {/* Explanation + Next */}
        {answered && (
          <div style={{ marginTop: 16 }}>
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
              {index + 1 >= total ? 'Voir les résultats' : 'Suivant →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
