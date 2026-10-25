// Icônes au trait, 28 px, couleur = currentColor
const base = {
  width: 28,
  height: 28,
  viewBox: '0 0 28 28',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export const SeriesIcon = () => (
  <svg {...base}>
    <rect x="4" y="4" width="14" height="14" rx="3" />
    <path d="M10 22h10a4 4 0 004-4V10" />
    <path d="M8 11l2 2 3-4" />
  </svg>
)

export const TrainingIcon = () => (
  <svg {...base}>
    <circle cx="14" cy="14" r="10" />
    <path d="M11 9.5v9l8-4.5-8-4.5z" />
  </svg>
)

export const ExamIcon = () => (
  <svg {...base}>
    <circle cx="14" cy="15" r="9" />
    <path d="M14 15V9.5M11 3h6" />
  </svg>
)

export const SheetsIcon = () => (
  <svg {...base}>
    <path d="M6 4h12a2 2 0 012 2v18H8a2 2 0 01-2-2V4z" />
    <path d="M10 10h6M10 14h6M10 18h3" />
  </svg>
)

export const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size} role="img" aria-label="Verrouillé" aria-hidden={undefined}>
    <rect x="5" y="12" width="18" height="12" rx="3" />
    <path d="M9 12V9a5 5 0 0110 0v3" />
  </svg>
)

export const ChevronIcon = () => (
  <svg {...base} width={18} height={18} strokeWidth={2}>
    <path d="M10 6l8 8-8 8" />
  </svg>
)
