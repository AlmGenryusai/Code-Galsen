import { CarnetView } from '@/components/carnet/CarnetView'
import { getQuestions } from '@/lib/quiz/questions'

export default function CarnetPage() {
  return <CarnetView questions={getQuestions().map(({ id, theme }) => ({ id, theme }))} />
}
