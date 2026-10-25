'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuizView } from './QuizView'
import { pickDue } from '@/lib/quiz/srs'
import { pickSeries } from '@/lib/quiz/series'
import { useProgress } from '@/lib/progress/use-progress'
import { redirectFor, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'
import { themeTitle } from '@/lib/quiz/taxonomy'
import type { QuestionV2 } from '@/lib/quiz/types'

const DUE_LIMIT = 20

interface Props {
  questions: QuestionV2[]
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

  const { progress, loaded, recordSeries } = useProgress()
  // Liste figée au démarrage : la file change à chaque réponse
  const [due, setDue] = useState<QuestionV2[] | null>(null)

  useEffect(() => {
    if (!isErrors || !loaded || due !== null) return
    const byId = new Map(questions.map((q) => [q.id, q]))
    // ids inconnus (anciennes questions) écartés avant pickDue : ils ne doivent pas prendre de place
    const known = Object.values(progress.srs).filter((s) => byId.has(s.questionId))
    setDue(pickDue(known, DUE_LIMIT).map((s) => byId.get(s.questionId)!))
  }, [isErrors, loaded, due, questions, progress.srs])

  if (!license.loaded || redirect) return null
  if (target.kind === 'theme') {
    return <ThemeSeries questions={questions} theme={target.theme} onFinish={recordSeries} />
  }
  if (!isErrors) return <QuizView questions={questions} title="Entraînement" />
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

  return <QuizView questions={due} title="Mes erreurs" />
}

/** Série thématique : jusqu'à 10 questions tirées au montage, note enregistrée à la fin. */
function ThemeSeries({
  questions,
  theme,
  onFinish,
}: {
  questions: QuestionV2[]
  theme: string
  onFinish: (theme: string, score: number, total: number) => void
}) {
  const [picked] = useState(() => pickSeries(questions, theme))
  return (
    <QuizView
      questions={picked}
      title={`Série « ${themeTitle(theme)} »`}
      onFinish={(score, total) => onFinish(theme, score, total)}
    />
  )
}
