'use client'

// P01: badge discret >7j, warn J-7, primary J-2
function daysLeft(exp: number): number {
  return Math.max(0, Math.ceil((exp * 1000 - Date.now()) / 86_400_000))
}

export function PassChip({ passExpiresAt }: { passExpiresAt: number }) {
  const days = daysLeft(passExpiresAt)

  if (days > 7) {
    // Discret : texte seul, pas de chip
    return (
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        color: 'hsl(var(--muted))',
      }}>
        Pass · {days}j
      </span>
    )
  }

  if (days > 2) {
    // Warn
    return (
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        padding: '3px 10px',
        borderRadius: 99,
        background: 'hsl(var(--warn-soft))',
        color: 'hsl(var(--text))',
        fontWeight: 600,
      }}>
        Pass · {days}j ⚠
      </span>
    )
  }

  // Urgent J-2
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.06em',
      padding: '3px 10px',
      borderRadius: 99,
      background: 'hsl(var(--primary))',
      color: 'hsl(var(--text))',
      fontWeight: 700,
    }}>
      Pass · {days}j !
    </span>
  )
}
