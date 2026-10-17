import { Suspense } from 'react'
import { QuizEntry } from '@/components/quiz/QuizEntry'
import { getQuestions } from '@/lib/quiz/questions'

// Suspense : useSearchParams côté client, la page reste statique (hors ligne)
export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizEntry questions={getQuestions()} />
    </Suspense>
  )
}
