'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionBody } from './QuestionBody'
import { isCorrect, needsValidation, togglePick } from '@/lib/quiz/correction'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import { useQuestionGuards } from '@/lib/quiz/use-question-guards'
import { useProgress } from '@/lib/progress/use-progress'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

interface QuizViewProps {
  questions: QuestionV2[]
}

export function QuizView({ questions }: QuizViewProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<OptionId[][]>([])
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const total = questions.length
  const validate = needsValidation(q)
  const ready = q.parts.every((_, i) => (picked[i]?.length ?? 0) > 0)

  const { tryAnswer, tryNavigate } = useQuestionGuards(index)
  const { recordAnswer } = useProgress()

  function submit(answers: OptionId[][]) {
    if (!tryAnswer()) return
    setPicked(answers)
    setAnswered(true)
    const ok = isCorrect(q, answers)
    if (ok) setScore(s => s + 1)
    recordAnswer(q.id, ok)
  }

  function handlePick(partIndex: number, id: OptionId) {
    if (answered) return
    const next = q.parts.map((_, i) => picked[i] ?? [])
    next[partIndex] = togglePick(q.parts[partIndex], next[partIndex], id)
    if (validate) setPicked(next)
    else submit(next)
  }

  function handleNext() {
    if (!tryNavigate()) return
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setPicked([])
      setAnswered(false)
    }
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    const pass = pct >= EXAM_CONFIG.passThresholdPct
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Entraînement
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }}>
            {index + 1} / {total}
          </div>
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

      {/* Question + options — scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        // réserve la hauteur de la barre fixe du bas (bouton + marges + zone sûre iPhone)
        paddingBottom: answered || validate ? 'calc(100px + env(safe-area-inset-bottom))' : 20,
      }}>
        <QuestionBody question={q} picked={picked} revealed={answered} onPick={handlePick} />
      </div>

      {/* Bouton fixe bas — toujours dans zone pouce */}
      {(answered || validate) && (
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
            {!answered ? 'Valider' : index + 1 >= total ? 'Voir les résultats' : 'Suivant →'}
          </button>
        </div>
      )}
    </div>
  )
}
