'use client'

import { useEffect, useRef, useState } from 'react'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { ExamDebrief, type ExamAnswer } from './ExamDebrief'
import { isCorrect, togglePick } from '@/lib/quiz/correction'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import { targetScore } from '@/lib/quiz/exam'
import { useQuestionGuards } from '@/lib/quiz/use-question-guards'
import { useProgress } from '@/lib/progress/use-progress'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

const { timerSeconds: TIMER_SECONDS } = EXAM_CONFIG

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

      <QuestionCard
        question={q}
        index={index}
        total={total}
        picked={picked}
        revealed={false}
        variant="exam"
        onPick={handlePick}
        onSubmit={() => finishQuestion(q.parts.map((_, i) => picked[i] ?? []), false)}
        onNext={() => {}}
      />
    </div>
  )
}
