'use client'

import { useSearchParams } from 'next/navigation'
import { ChapterView } from './ChapterView'
import { LessonList } from './LessonList'
import { SheetView } from './SheetView'
import { parseSheetParam } from '@/lib/lessons/lessons'
import type { LessonFile } from '@/lib/lessons/types'

/**
 * /fiches : les thèmes ; ?c=<chapitre> : ses fiches ; ?c=…&f=N : la fiche N.
 * Chapitre inconnu → les thèmes ; fiche inconnue → le chapitre.
 */
export function LessonsEntry({ lessons }: { lessons: LessonFile[] }) {
  const params = useSearchParams()
  const lesson = lessons.find((l) => l.id === params.get('c'))
  if (!lesson) return <LessonList lessons={lessons} />
  const n = parseSheetParam(params.get('f'), lesson.sheets.length)
  return n === null ? <ChapterView lesson={lesson} /> : <SheetView lesson={lesson} n={n} />
}
