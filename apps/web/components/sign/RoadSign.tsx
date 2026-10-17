import { SIGNS } from './signs'

interface RoadSignProps {
  id: string // clé de SIGNS
  size?: number
}

export function RoadSign({ id, size = 96 }: RoadSignProps) {
  const sign = SIGNS[id]
  if (!sign) return null
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sign.label}>
      {sign.draw()}
    </svg>
  )
}
