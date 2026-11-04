import { LetterBadge, type BadgeState } from './LetterBadge'

export type OptionState = 'idle' | 'checked' | 'correct' | 'missed' | 'wrong' | 'disabled'

interface AnswerLineProps {
  letter: string // pastille affichée
  text: string
  state: OptionState
  mono?: boolean
}

const SR_ONLY = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const

/** Ligne de réponse façon examen : texte, pointillés, pastille. Non cliquable : on coche dans la grille du bas. */
export function AnswerLine({ letter, text, state, mono }: AnswerLineProps) {
  const badge: BadgeState = state === 'idle' || state === 'disabled' ? 'idle' : state
  const srNote = state === 'wrong' ? ' (fausse)' : state === 'missed' ? ' (bonne réponse non cochée)' : state === 'correct' ? ' (bonne réponse)' : ''

  return (
    <div
      data-line={letter}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        minWidth: 0,
        opacity: state === 'disabled' ? 0.7 : 1,
      }}
    >
      {state === 'checked' && (
        <span aria-hidden="true" style={{ position: 'absolute', left: -16, top: 8, fontSize: 12, color: 'hsl(var(--ink))' }}>
          ▶
        </span>
      )}
      <span
        style={{
          fontSize: 18,
          lineHeight: 1.35,
          fontWeight: 400,
          paddingBottom: 6,
          color: 'hsl(var(--ink))',
          textDecoration: state === 'wrong' ? 'line-through' : undefined,
        }}
      >
        {text}
        {srNote && <span style={SR_ONLY}>{srNote}</span>}
      </span>
      <span aria-hidden="true" style={{ flex: 1, minWidth: 12, marginBottom: 14, borderBottom: '1.5px dashed hsl(var(--sand))' }} />
      {state === 'missed' && (
        <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--right))', whiteSpace: 'nowrap', paddingBottom: 8 }}>à cocher</span>
      )}
      <span style={{ paddingBottom: 2 }}>
        <LetterBadge letter={letter} state={badge} mono={mono} />
      </span>
    </div>
  )
}
