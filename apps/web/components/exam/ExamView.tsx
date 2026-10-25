'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionBody } from '@/components/quiz/QuestionBody'
import { isCorrect, togglePick } from '@/lib/quiz/correction'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import { useQuestionGuards } from '@/lib/quiz/use-question-guards'
import { useProgress } from '@/lib/progress/use-progress'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

const { timerSeconds: TIMER_SECONDS, maxFaults: MAX_FAULTS } = EXAM_CONFIG

interface ExamViewProps {
  questions: QuestionV2[]
}

type ExamResult = 'pass' | 'fail'

export function ExamView({ questions }: ExamViewProps) {
  const router = useRouter()
  const total = questions.length

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<OptionId[][]>([])
  const [submitted, setSubmitted] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [faults, setFaults] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SECONDS)

  const { tryAnswer, tryNavigate } = useQuestionGuards(index)
  const { recordExam } = useProgress()

  const q = questions[index]
  const answered = submitted || timedOut
  const ready = q.parts.every((_, i) => (picked[i]?.length ?? 0) > 0)
  const isLast = index + 1 >= total

  useEffect(() => {
    if (answered || result !== null) return
    if (timeLeft <= 0) {
      if (!tryAnswer()) return
      setTimedOut(true)
      setFaults(f => f + 1)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, answered, result])

  function submit(answers: OptionId[][]) {
    if (!tryAnswer()) return
    setPicked(answers)
    setSubmitted(true)
    if (!isCorrect(q, answers)) setFaults(f => f + 1)
  }

  function handlePick(partIndex: number, id: OptionId) {
    if (answered) return
    const next = q.parts.map((_, i) => picked[i] ?? [])
    next[partIndex] = togglePick(q.parts[partIndex], next[partIndex], id)
    setPicked(next)
  }

  function handleNext() {
    if (!tryNavigate()) return
    if (isLast) {
      const passed = faults <= MAX_FAULTS
      const correct = Math.max(0, total - faults)
      recordExam({ score: Math.round((correct / total) * 100), faults, total, passed })
      setResult(passed ? 'pass' : 'fail')
    } else {
      setIndex(i => i + 1)
      setPicked([])
      setSubmitted(false)
      setTimedOut(false)
      setTimeLeft(TIMER_SECONDS)
    }
  }

  if (result !== null) {
    const correct = Math.max(0, total - faults)
    const pct = Math.round((correct / total) * 100)
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
          {correct}/{total} bonnes réponses
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
      {/* Timer bar */}
      <div style={{ height: 3, background: 'hsl(var(--border))', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${timerPct}%`,
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
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted))' }}>
          Q {index + 1} / {total}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: MAX_FAULTS }).map((_, i) => (
            <div key={i} style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < faults ? 'hsl(var(--error))' : 'hsl(var(--border))',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* Question + options — scrollable si débordement */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 4,
        // QuestionBody gère ses marges latérales (média pleine largeur)
        paddingBottom: 'calc(90px + env(safe-area-inset-bottom))',
      }}>
        <QuestionBody question={q} picked={picked} revealed={answered} onPick={handlePick} />

        {/* Explication inline — bouton en position fixe bas */}
        {answered && (
          <div style={{ padding: '16px 20px 0' }}>
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
          </div>
        )}
      </div>

      {/* Action bar — position fixe bas, toujours dans zone pouce */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        background: 'hsl(var(--bg))',
        borderTop: '1px solid hsl(var(--border))',
      }}>
        <button
          onClick={answered ? handleNext : () => submit(q.parts.map((_, i) => picked[i] ?? []))}
          disabled={!answered && !ready}
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
            cursor: !answered && !ready ? 'default' : 'pointer',
            opacity: !answered && !ready ? 0.5 : 1,
          }}
        >
          {!answered ? 'Valider' : isLast ? 'Voir les résultats' : 'Question suivante →'}
        </button>
      </div>
    </div>
  )
}
