import { LetterBadge, type BadgeState } from './LetterBadge'

export type OptionState = 'idle' | 'checked' | 'correct' | 'missed' | 'wrong' | 'disabled'

interface QuizOptionProps {
  id: string // 'A' | 'B' | 'C' | 'D' : la lettre affichée
  text: string
  state: OptionState
  onSelect: () => void
  mono?: boolean
}

const SR_ONLY = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const

export function QuizOption({ id, text, state, onSelect, mono }: QuizOptionProps) {
  const idle = state === 'idle' || state === 'checked'

  const bg =
    state === 'correct' ? 'hsl(var(--right-soft))' :
    state === 'wrong'   ? 'hsl(var(--wrong-soft))' :
    'hsl(var(--surface))'

  const border =
    state === 'correct' ? '2px solid hsl(var(--right))' :
    state === 'missed'  ? '2px dashed hsl(var(--right))' :
    state === 'wrong'   ? '2px solid hsl(var(--wrong))' :
    state === 'checked' ? '2px solid hsl(var(--structure))' :
    '1.5px solid hsl(var(--sand))'

  const mark = state === 'correct' || state === 'missed' ? '✓' : state === 'wrong' ? '✕' : null
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
      <LetterBadge letter={id} state={badge} mono={mono} />
      <span
        style={{
          flex: 1,
          fontSize: 18,
          lineHeight: 1.4,
          fontWeight: 500,
          color: 'hsl(var(--ink))',
          textDecoration: state === 'wrong' ? 'line-through' : undefined,
        }}
      >
        {text}
      </span>
      {state === 'missed' && (
        <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--right))', whiteSpace: 'nowrap' }}>à cocher</span>
      )}
      {mark && <span style={SR_ONLY}>{state === 'wrong' ? ' (fausse)' : state === 'missed' ? ' (bonne réponse non cochée)' : ' (bonne réponse)'}</span>}
    </button>
  )
}
