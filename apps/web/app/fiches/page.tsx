import { Suspense } from 'react'
import { LessonsEntry } from '@/components/lessons/LessonsEntry'
import { getLessons } from '@/lib/lessons/lessons'

// Suspense : useSearchParams côté client, la page reste statique (hors ligne)
export default function LessonsPage() {
  return (
    <Suspense fallback={null}>
      <LessonsEntry lessons={getLessons()} />
    </Suspense>
  )
}
