'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuizView } from './QuizView'
import { pickDue } from '@/lib/quiz/srs'
import { useProgress } from '@/lib/progress/use-progress'
import { redirectFor, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import type { Question } from '@/lib/quiz/types'

const DUE_LIMIT = 20

interface Props {
  questions: Question[]
}

/**
 * /quiz : entraînement sur tout le programme, /quiz?theme=<thème> : un thème,
 * /quiz?mode=erreurs : questions dues de la file SRS. Verrou gratuit / payant : lib/license.
 */
export function QuizEntry({ questions }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const isErrors = params.get('mode') === 'erreurs'
  const theme = params.get('theme')
  const themed = theme ? questions.filter((q) => q.theme === theme) : []
  // Thème inconnu → traité comme /quiz sans thème
  const target: Target = isErrors
    ? { kind: 'errors' }
    : theme && themed.length > 0
      ? { kind: 'theme', theme }
      : { kind: 'all' }

  const license = useLicense()
  const redirect = license.loaded ? redirectFor(target, license) : null

  useEffect(() => {
    if (redirect) router.replace(redirect)
  }, [redirect, router])

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

  if (!license.loaded || redirect) return null
  if (target.kind === 'theme') return <QuizView questions={themed} />
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
