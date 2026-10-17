import { QuizView } from '@/components/quiz/QuizView'
import { getQuestions } from '@/lib/quiz/questions'

export default function QuizPage() {
  return <QuizView questions={getQuestions()} />
}
