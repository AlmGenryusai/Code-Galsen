'use client'

import type { License } from '@/lib/license/license'

// Sur le bandeau vert : texte crème ; pastille sable quand l'échéance approche
function daysLeft(exp: number): number {
  return Math.max(0, Math.ceil((exp * 1000 - Date.now()) / 86_400_000))
}

const PLAIN = { fontSize: 14, fontWeight: 600, color: 'hsl(var(--bg))' } as const
const PILL = {
  fontSize: 14,
  fontWeight: 700,
  padding: '4px 12px',
  borderRadius: 99,
  background: 'hsl(var(--sand))',
  color: 'hsl(var(--ink))',
} as const

export function PassChip({ license }: { license: License }) {
  if (!license.active || license.expiresAt === null) {
    return <span style={PLAIN}>Version gratuite</span>
  }
  const days = daysLeft(license.expiresAt)
  return <span style={days > 7 ? PLAIN : PILL}>Pass · {days} j</span>
}
