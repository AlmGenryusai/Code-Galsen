import { ExamGate } from '@/components/exam/ExamGate'
import { getQuestions } from '@/lib/quiz/questions'
import type { QuestionV2 } from '@/lib/quiz/types'

function shuffle(arr: QuestionV2[]): QuestionV2[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ExamenPage() {
  return <ExamGate questions={shuffle(getQuestions())} />
}
