'use client'

import { useEffect, useRef, useState } from 'react'
import { QuestionBody } from '@/components/quiz/QuestionBody'
import { ExamDebrief, type ExamAnswer } from './ExamDebrief'
import { answerKind, isCorrect, togglePick } from '@/lib/quiz/correction'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import { targetScore } from '@/lib/quiz/exam'
import { useQuestionGuards } from '@/lib/quiz/use-question-guards'
import { useProgress } from '@/lib/progress/use-progress'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

const { timerSeconds: TIMER_SECONDS } = EXAM_CONFIG
const BAR_HEIGHT = 72
const KIND_LABEL = { single: 'Une seule réponse', multi: 'Plusieurs réponses', double: 'Question double' }

interface ExamViewProps {
  questions: QuestionV2[]
}

/** Examen blanc : on coche, on valide, on passe à la suite. Aucune correction avant le débrief. */
export function ExamView({ questions }: ExamViewProps) {
  const total = questions.length

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<OptionId[][]>([])
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_SECONDS)
  const [answers, setAnswers] = useState<ExamAnswer[]>([])
  const [done, setDone] = useState(false)

  const { tryAnswer, tryNavigate } = useQuestionGuards(index)
  const { recordAnswer, recordExam } = useProgress()

  const q = questions[index]
  const ready = q ? q.parts.every((_, i) => (picked[i]?.length ?? 0) > 0) : false
  const isLast = index + 1 >= total

  function finishQuestion(given: OptionId[][], timedOut: boolean) {
    if (!tryAnswer()) return
    const all = [...answers, { picked: given, correct: !timedOut && isCorrect(q, given), timedOut }]
    setAnswers(all)
    tryNavigate()
    if (!isLast) {
      setIndex((i) => i + 1)
      setPicked([])
      setTimeLeft(TIMER_SECONDS)
      return
    }
    const correct = all.filter((a) => a.correct).length
    all.forEach((a, i) => recordAnswer(questions[i].id, a.correct))
    recordExam({
      score: Math.round((correct / total) * 100),
      faults: total - correct,
      total,
      passed: correct >= targetScore(total),
    })
    setDone(true)
  }

  // Dernière version du handler : l'effet du minuteur n'a pas à le citer dans ses dépendances.
  const onTimeout = useRef(finishQuestion)
  onTimeout.current = finishQuestion

  useEffect(() => {
    if (done || total === 0) return
    if (timeLeft <= 0) {
      onTimeout.current([], true)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, done, total])

  function handlePick(partIndex: number, id: OptionId) {
    const next = q.parts.map((_, i) => picked[i] ?? [])
    next[partIndex] = togglePick(q.parts[partIndex], next[partIndex], id)
    setPicked(next)
  }

  if (total === 0) return null
  if (done) return <ExamDebrief questions={questions} answers={answers} />

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête */}
      <div style={{ background: 'hsl(var(--structure))', color: 'hsl(var(--bg))', padding: '0 16px', minHeight: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Examen blanc</div>
        <div style={{ fontSize: 14, opacity: 0.85 }} aria-label={`${timeLeft} secondes restantes`}>{timeLeft} s</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{index + 1} / {total}</div>
      </div>
      <div style={{ height: 4, background: 'hsl(var(--structure))' }}>
        <div style={{
          height: '100%',
          width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
          background: 'hsl(var(--primary))',
          transition: 'width 1s linear',
        }} />
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: `calc(${BAR_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`,
      }}>
        <QuestionBody question={q} picked={picked} revealed={false} onPick={handlePick} />
      </div>

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
          onClick={() => finishQuestion(q.parts.map((_, i) => picked[i] ?? []), false)}
          disabled={!ready}
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
            opacity: ready ? 1 : 0.5,
          }}
        >
          {isLast ? 'Terminer' : 'Valider'}
        </button>
      </div>
    </div>
  )
}
