import { LetterBadge, type BadgeState } from './LetterBadge'

export type OptionState = 'idle' | 'checked' | 'correct' | 'wrong' | 'disabled'

interface QuizOptionProps {
  id: string // 'A' | 'B' | 'C' | 'D' : la lettre affichée
  text: string
  state: OptionState
  onSelect: () => void
}

const SR_ONLY = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const

export function QuizOption({ id, text, state, onSelect }: QuizOptionProps) {
  const idle = state === 'idle' || state === 'checked'

  const bg =
    state === 'correct' ? 'hsl(var(--right-soft))' :
    state === 'wrong'   ? 'hsl(var(--wrong-soft))' :
    'hsl(var(--surface))'

  const border =
    state === 'correct' ? '2px solid hsl(var(--right))' :
    state === 'wrong'   ? '2px solid hsl(var(--wrong))' :
    state === 'checked' ? '2px solid hsl(var(--structure))' :
    '1.5px solid hsl(var(--sand))'

  const mark = state === 'correct' ? '✓' : state === 'wrong' ? '✕' : null
  const badge: BadgeState = state === 'idle' || state === 'disabled' ? 'idle' : state

  return (
    <button
      onClick={idle ? onSelect : undefined}
      aria-pressed={idle ? state === 'checked' : undefined}
      disabled={state === 'disabled'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 56,
        padding: '10px 12px',
        background: bg,
        border,
        borderRadius: 'var(--radius)',
        textAlign: 'left',
        cursor: idle ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
        opacity: state === 'disabled' ? 0.75 : 1,
      }}
    >
      <LetterBadge letter={id} state={badge} />
      <span style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 500, color: 'hsl(var(--ink))' }}>
        {text}
      </span>
      {mark && <span style={SR_ONLY}>{state === 'correct' ? ' (bonne réponse)' : ' (fausse)'}</span>}
    </button>
  )
}
