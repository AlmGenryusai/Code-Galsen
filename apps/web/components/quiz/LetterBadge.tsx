export type BadgeState = 'idle' | 'checked' | 'correct' | 'wrong'

interface LetterBadgeProps {
  letter: string // 'A' | 'B' | 'C' | 'D'
  state?: BadgeState
  size?: number
}

// Forme + couleur propres à chaque lettre : la lettre n'est jamais le seul repère.
// Couleurs ≥ 4.5:1 sur blanc (texte blanc sur fond plein) et sur le fond de l'app (contour).
const STYLE: Record<string, { color: string; shape: 'circle' | 'square' | 'triangle' | 'diamond' }> = {
  A: { color: '#1F5E4A', shape: 'circle' },
  B: { color: '#1F5FA8', shape: 'square' },
  C: { color: '#8A4B00', shape: 'triangle' },
  D: { color: '#8E2A6B', shape: 'diamond' },
}

const POINTS = { triangle: '16,3 30,28 2,28', diamond: '16,2 30,16 16,30 2,16' }

/** Pastille SVG : contour seul = libre, pleine = cochée, verte ✓ / rouge ✕ après correction. */
export function LetterBadge({ letter, state = 'idle', size = 32 }: LetterBadgeProps) {
  const { color: base, shape } = STYLE[letter] ?? STYLE.A
  const color = state === 'correct' ? 'hsl(var(--right))' : state === 'wrong' ? 'hsl(var(--wrong))' : base
  const filled = state !== 'idle'
  const mark = state === 'correct' ? '✓' : state === 'wrong' ? '✕' : null
  const common = {
    fill: filled ? color : 'hsl(var(--surface))',
    stroke: color,
    strokeWidth: 2.5,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      data-shape={shape}
      style={{ flexShrink: 0 }}
    >
      {shape === 'circle' && <circle cx="16" cy="16" r="13.5" {...common} />}
      {shape === 'square' && <rect x="3" y="3" width="26" height="26" rx="6" {...common} />}
      {(shape === 'triangle' || shape === 'diamond') && <polygon points={POINTS[shape]} {...common} />}
      <text
        x="16"
        y={shape === 'triangle' ? 24 : 21.5}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fontFamily="inherit"
        fill={filled ? '#fff' : color}
      >
        {mark ?? letter}
      </text>
    </svg>
  )
}
