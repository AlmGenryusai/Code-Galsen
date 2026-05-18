import { QuizView } from '@/components/quiz/QuizView'
import { MOCK_QUESTIONS } from '@/lib/quiz/mock-questions'

export default function QuizPage() {
  return <QuizView questions={MOCK_QUESTIONS} />
}
