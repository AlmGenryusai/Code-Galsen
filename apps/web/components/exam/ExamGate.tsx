'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExamView } from './ExamView'
import { ACTIVATE_HREF, canAccess } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import { useProgress } from '@/lib/progress/use-progress'
import type { Question } from '@/lib/quiz/types'

/** 1er examen blanc libre, ensuite licence requise. Décision prise une fois à l'entrée. */
export function ExamGate({ questions }: { questions: Question[] }) {
  const router = useRouter()
  const license = useLicense()
  const { progress, loaded } = useProgress()
  // Figée : la fin du 1er examen incrémente progress.exams sans éjecter l'écran de résultat
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    if (allowed !== null || !loaded || !license.loaded) return
    const ok = canAccess({ kind: 'exam', examsTaken: progress.exams.length }, license)
    setAllowed(ok)
    if (!ok) router.replace(ACTIVATE_HREF)
  }, [allowed, loaded, license, progress.exams.length, router])

  // Chrono d'ExamView démarré seulement après la décision
  if (!allowed) return null
  return <ExamView questions={questions} />
}
