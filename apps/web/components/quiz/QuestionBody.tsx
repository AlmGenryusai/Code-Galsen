import { MediaFrame } from './MediaFrame'
import { QuizOption, type OptionState } from './QuizOption'
import { isCorrect } from '@/lib/quiz/correction'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

interface QuestionBodyProps {
  question: QuestionV2
  picked: OptionId[][] // cases cochées, une liste par partie
  revealed: boolean // correction affichée (question validée ou temps écoulé)
  onPick: (partIndex: number, id: OptionId) => void
}

const SHOW_DRAFT_BADGE = process.env.NODE_ENV !== 'production'

/** Média pleine largeur, parties avec options, correction. Sans bouton : Valider / Suivant sont dans la vue. */
export function QuestionBody({ question: q, picked, revealed, onPick }: QuestionBodyProps) {
  const ok = revealed && isCorrect(q, picked)

  return (
    <>
      <MediaFrame media={q.media} />

      <div style={{ padding: '16px 20px 0' }}>
        {SHOW_DRAFT_BADGE && q.status === 'draft' && (
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: 'hsl(var(--muted))' }}>
            Brouillon
          </div>
        )}

        {q.parts.map((part, pi) => (
          <div key={pi} style={{ marginBottom: pi < q.parts.length - 1 ? 24 : 0 }}>
            <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, color: 'hsl(var(--ink))', marginBottom: 12 }}>
              {part.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {part.options.map((opt) => {
                const isPicked = picked[pi]?.includes(opt.id) ?? false
                const isRight = part.correct.includes(opt.id)
                const state: OptionState = !revealed
                  ? isPicked ? 'checked' : 'idle'
                  : isRight ? 'correct' : isPicked ? 'wrong' : 'disabled'
                return (
                  <QuizOption key={opt.id} id={opt.id} text={opt.text} state={state} onSelect={() => onPick(pi, opt.id)} />
                )
              })}
            </div>
          </div>
        ))}

        {revealed && (
          <div style={{ marginTop: 20 }}>
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                fontSize: 16,
                fontWeight: 700,
                background: ok ? 'hsl(var(--right-soft))' : 'hsl(var(--wrong-soft))',
                color: ok ? 'hsl(var(--right))' : 'hsl(var(--wrong))',
              }}
            >
              <span aria-hidden="true">{ok ? '✓' : '✕'}</span>
              {ok ? 'Juste' : 'Pas tout à fait'}
            </div>
            {q.explanation && (
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5, color: 'hsl(var(--ink))' }}>
                {q.explanation}
              </p>
            )}
            {q.common_mistake && (
              <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5, color: 'hsl(var(--ink))' }}>
                <strong>Erreur fréquente :</strong> {q.common_mistake}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
