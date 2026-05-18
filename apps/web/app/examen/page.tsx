import { ExamView } from '@/components/exam/ExamView'
import { MOCK_QUESTIONS } from '@/lib/quiz/mock-questions'
import type { Question } from '@/lib/quiz/mock-questions'

function shuffle(arr: Question[]): Question[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ExamenPage() {
  return <ExamView questions={shuffle(MOCK_QUESTIONS)} />
}
