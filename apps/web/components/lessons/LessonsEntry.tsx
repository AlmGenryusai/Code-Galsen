'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
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
  const key = params.toString()
  // Même page, paramètres différents : le navigateur garde la position de défilement, on repart en haut
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [key])
  const lesson = lessons.find((l) => l.id === params.get('c'))
  if (!lesson) return <LessonList lessons={lessons} openTheme={params.get('t')} />
  const n = parseSheetParam(params.get('f'), lesson.sheets.length)
  if (n === null) return <ChapterView lesson={lesson} />
  // Chapitre suivant du même thème, pour enchaîner sans repasser par la liste
  const sameTheme = lessons.filter((l) => l.theme === lesson.theme)
  const next = sameTheme[sameTheme.findIndex((l) => l.id === lesson.id) + 1]
  return <SheetView lesson={lesson} n={n} next={next} />
}
