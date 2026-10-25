import { SIGNS } from './signs'

interface RoadSignProps {
  id: string // clé de SIGNS
  size?: number
}

export function RoadSign({ id, size = 96 }: RoadSignProps) {
  const sign = SIGNS[id]
  if (!sign) return null
  if (sign.file) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/signs/${sign.file}.svg`} alt={sign.label} width={size} height={size} />
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={sign.label}>
      {sign.draw?.()}
    </svg>
  )
}
