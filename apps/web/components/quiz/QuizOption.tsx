interface QuizOptionProps {
  id: string
  text: string
  state: 'idle' | 'correct' | 'wrong' | 'disabled'
  onSelect: () => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }

export function QuizOption({ id, text, state, onSelect }: QuizOptionProps) {
  const label = OPTION_LABELS[OPTION_INDEX[id] ?? 0]

  const bg =
    state === 'correct' ? 'hsl(var(--success-soft))' :
    state === 'wrong'   ? 'hsl(var(--error-soft))' :
    'hsl(var(--surface))'

  const border =
    state === 'correct' ? '2px solid hsl(var(--success))' :
    state === 'wrong'   ? '2px solid hsl(var(--error))' :
    '1.5px solid hsl(var(--border))'

  const icon =
    state === 'correct' ? '✓' :
    state === 'wrong'   ? '✕' :
    null

  return (
    <button
      onClick={state === 'idle' ? onSelect : undefined}
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
        cursor: state === 'idle' ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: state === 'idle' ? 'hsl(var(--surface-2))' : 'transparent',
        border: state === 'idle' ? '1.5px solid hsl(var(--border-2))' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: 'hsl(var(--muted))',
      }}>
        {icon ?? label}
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
