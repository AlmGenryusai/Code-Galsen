'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionBody } from './QuestionBody'
import { answerKind, isCorrect, togglePick } from '@/lib/quiz/correction'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import { useQuestionGuards } from '@/lib/quiz/use-question-guards'
import { useProgress } from '@/lib/progress/use-progress'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

interface QuizViewProps {
  questions: QuestionV2[]
  title: string // nom de la série dans l'en-tête
  onFinish?: (score: number, total: number) => void // appelé une fois, à la dernière question
}

const BAR_HEIGHT = 72
const KIND_LABEL = { single: 'Une seule réponse', multi: 'Plusieurs réponses', double: 'Question double' }

export function QuizView({ questions, title, onFinish }: QuizViewProps) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<OptionId[][]>([])
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const total = questions.length
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
    setPicked(next)
  }

  function handleNext() {
    if (!tryNavigate()) return
    if (index + 1 >= total) {
      setDone(true)
      onFinish?.(score, total)
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
      {/* En-tête */}
      <div style={{ background: 'hsl(var(--structure))', color: 'hsl(var(--bg))', padding: '4px 12px 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 28, lineHeight: 1, minWidth: 44, minHeight: 48 }}
          aria-label="Retour"
        >
          ‹
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{index + 1} / {total}</div>
      </div>
      <div style={{ height: 4, background: 'hsl(var(--structure))' }}>
        <div style={{
          height: '100%',
          width: `${((index + (answered ? 1 : 0)) / total) * 100}%`,
          background: 'hsl(var(--primary))',
        }} />
      </div>

      {/* Média + question + options — défile */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        // hauteur de la barre fixe du bas + zone sûre
        paddingBottom: `calc(${BAR_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`,
      }}>
        <QuestionBody question={q} picked={picked} revealed={answered} onPick={handlePick} />
      </div>

      {/* Barre fixe du bas */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 430,
        margin: '0 auto',
        height: `calc(${BAR_HEIGHT}px + env(safe-area-inset-bottom))`,
        padding: '0 16px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: 'hsl(var(--bg))',
        borderTop: '1px solid hsl(var(--sand))',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--ink))' }}>{KIND_LABEL[answerKind(q)]}</div>
        <button
          onClick={answered ? handleNext : () => submit(q.parts.map((_, i) => picked[i] ?? []))}
          disabled={!answered && !ready}
          style={{
            minWidth: 140,
            minHeight: 48,
            padding: '0 24px',
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--ink))',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            opacity: !answered && !ready ? 0.5 : 1,
          }}
        >
          {!answered ? 'Valider' : index + 1 >= total ? 'Voir les résultats' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}
