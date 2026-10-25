import { QuizOption, type OptionState } from './QuizOption'
import { RoadSign } from '@/components/sign/RoadSign'
import type { OptionId, QuestionV2 } from '@/lib/quiz/types'

interface QuestionBodyProps {
  question: QuestionV2
  picked: OptionId[][] // cases cochées, une liste par partie
  revealed: boolean // correction affichée (question validée ou temps écoulé)
  onPick: (partIndex: number, id: OptionId) => void
}

const SHOW_DRAFT_BADGE = process.env.NODE_ENV !== 'production'

/** Média, parties avec options, explication. Sans bouton : Valider / Suivant sont dans la vue. */
export function QuestionBody({ question: q, picked, revealed, onPick }: QuestionBodyProps) {
  return (
    <>
      {SHOW_DRAFT_BADGE && q.status === 'draft' && (
        <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--muted))' }}>
          brouillon
        </div>
      )}

      {q.media?.kind === 'sign' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <RoadSign id={q.media.src} size={72} />
        </div>
      )}

      {q.parts.map((part, pi) => (
        <div key={pi} style={{ marginBottom: pi < q.parts.length - 1 ? 24 : 0 }}>
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: 'hsl(var(--text))', marginBottom: 8 }}>
            {part.text}
          </p>
          {part.correct.length > 1 && (
            <p style={{ fontSize: 12, color: 'hsl(var(--muted))', marginBottom: 12 }}>Plusieurs réponses possibles</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: part.correct.length > 1 ? 0 : 12 }}>
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

      {revealed && q.explanation && (
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--muted))' }}>
          {q.explanation}
          {q.common_mistake && (
            <div style={{ marginTop: 8 }}>
              <strong>Erreur fréquente :</strong> {q.common_mistake}
            </div>
          )}
        </div>
      )}
    </>
  )
}
