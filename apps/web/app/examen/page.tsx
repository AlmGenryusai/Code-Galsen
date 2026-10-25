import { ExamGate } from '@/components/exam/ExamGate'
import { getQuestions } from '@/lib/quiz/questions'

export default function ExamenPage() {
  return <ExamGate questions={getQuestions()} />
}
