import { QuestionCard } from '../quiz/QuestionCard'
import type { QuestionV2 } from '../../lib/quiz/types'
import type { ExamAnswer } from './ExamDebrief'

const headerStyle = {
  background: 'hsl(var(--structure))',
  color: 'hsl(var(--bg))',
  padding: '0 16px',
  minHeight: 52,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const

interface CorrectionSheetProps {
  questions: QuestionV2[]
  answers: ExamAnswer[] // même ordre que `questions`
  index: number
  onStep: (dir: 1 | -1) => void // Précédent / Suivant ; Suivant sur la dernière ferme la feuille
  onClose: () => void
}

/** Feuille « Correction » de l'examen : une question à la fois, Précédent / Suivant, croix pour revenir au débrief. */
export function CorrectionSheet({ questions, answers, index, onStep, onClose }: CorrectionSheetProps) {
  const a = answers[index]
  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column' }}>
      <div style={headerStyle}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Correction</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{index + 1} / {questions.length}</div>
      </div>
      {a.timedOut && (
        <p style={{ padding: '12px 20px 0', fontSize: 15, fontWeight: 600, color: 'hsl(var(--wrong))' }}>Temps écoulé</p>
      )}
      <QuestionCard
        question={questions[index]}
        index={index}
        total={questions.length}
        picked={a.picked}
        revealed
        variant="correction"
        orders={a.orders}
        onPick={() => {}}
        onSubmit={() => {}}
        onPrev={() => onStep(-1)}
        onNext={() => onStep(1)}
        onClose={onClose}
      />
    </div>
  )
}
