import { SIGNS } from './signs'

interface RoadSignProps {
  id: string // clé de SIGNS
  size?: number
}

export function RoadSign({ id, size = 96 }: RoadSignProps) {
  const sign = SIGNS[id]
  if (!sign) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/signs/${sign.file}.svg`} alt={sign.label} width={size} height={size} />
}
