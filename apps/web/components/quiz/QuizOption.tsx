export type OptionState = 'idle' | 'checked' | 'correct' | 'wrong' | 'disabled'

interface QuizOptionProps {
  id: string // 'A' | 'B' | 'C' | 'D' : la lettre affichée
  text: string
  state: OptionState
  onSelect: () => void
}

export function QuizOption({ id, text, state, onSelect }: QuizOptionProps) {
  const idle = state === 'idle' || state === 'checked'

  const bg =
    state === 'correct' ? 'hsl(var(--success-soft))' :
    state === 'wrong'   ? 'hsl(var(--error-soft))' :
    state === 'checked' ? 'hsl(var(--surface-2))' :
    'hsl(var(--surface))'

  const border =
    state === 'correct' ? '2px solid hsl(var(--success))' :
    state === 'wrong'   ? '2px solid hsl(var(--error))' :
    state === 'checked' ? '2px solid hsl(var(--primary))' :
    '1.5px solid hsl(var(--border))'

  const icon =
    state === 'correct' ? '✓' :
    state === 'wrong'   ? '✕' :
    null

  return (
    <button
      onClick={idle ? onSelect : undefined}
      aria-pressed={state === 'checked'}
      disabled={state === 'disabled'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 64,
        padding: '14px 16px',
        background: bg,
        border,
        borderRadius: 'var(--radius)',
        textAlign: 'left',
        cursor: idle ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: idle ? 'hsl(var(--surface-2))' : 'transparent',
        border: idle ? '1.5px solid hsl(var(--border-2))' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: 'hsl(var(--muted))',
      }}>
        {icon ?? id}
      </span>
      <span style={{
        fontSize: 15,
        lineHeight: 1.4,
        fontWeight: 500,
        color: 'hsl(var(--text))',
      }}>
        {text}
      </span>
    </button>
  )
}
