'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QuizView } from './QuizView'
import { pickDue } from '@/lib/quiz/srs'
import { useProgress } from '@/lib/progress/use-progress'
import type { Question } from '@/lib/quiz/types'

const DUE_LIMIT = 20

interface Props {
  questions: Question[]
}

/** /quiz : entraînement normal, ou /quiz?mode=erreurs : questions dues de la file SRS. */
export function QuizEntry({ questions }: Props) {
  const isErrors = useSearchParams().get('mode') === 'erreurs'
  const { progress, loaded } = useProgress()
  // Liste figée au démarrage : la file change à chaque réponse
  const [due, setDue] = useState<Question[] | null>(null)

  useEffect(() => {
    if (!isErrors || !loaded || due !== null) return
    const byId = new Map(questions.map((q) => [q.id, q]))
    setDue(
      pickDue(Object.values(progress.srs), DUE_LIMIT)
        .map((s) => byId.get(s.questionId))
        .filter((q): q is Question => q !== undefined),
    )
  }, [isErrors, loaded, due, questions, progress.srs])

  if (!isErrors) return <QuizView questions={questions} />
  if (due === null) return null

  if (due.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 12 }}>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted))', textAlign: 'center', lineHeight: 1.6 }}>
          Aucune question à réviser pour l&apos;instant.
        </p>
        <Link href="/" style={{
          marginTop: 8,
          padding: '14px 32px',
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--text))',
          borderRadius: 'var(--radius)',
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          width: '100%',
          maxWidth: 320,
        }}>
          Retour au parcours
        </Link>
      </div>
    )
  }

  return <QuizView questions={due} />
}
