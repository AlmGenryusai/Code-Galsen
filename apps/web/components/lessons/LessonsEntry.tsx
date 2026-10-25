'use client'

import { useSearchParams } from 'next/navigation'
import { LessonList } from './LessonList'
import { LessonView } from './LessonView'
import type { Lesson } from '@/lib/lessons/types'

interface Props {
  lessons: Lesson[]
}

/** /fiches : la liste ; /fiches?c=<chapitre> : une fiche. Chapitre inconnu → la liste. */
export function LessonsEntry({ lessons }: Props) {
  const chapter = useSearchParams().get('c')
  const lesson = lessons.find((l) => l.id === chapter)
  return lesson ? <LessonView lesson={lesson} /> : <LessonList lessons={lessons} />
}
