import Link from 'next/link'
import { ChevronIcon, LockIcon } from './Icons'

interface ReviewChipProps {
  count: number
  href: string
  locked?: boolean
}

/** « À réviser » : file SRS (mes erreurs), une ligne sous la grille. */
export function ReviewChip({ count, href, locked }: ReviewChipProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        minHeight: 52,
        padding: '0 14px',
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--sand))',
        borderRadius: 'var(--radius)',
        textDecoration: 'none',
        color: 'hsl(var(--ink))',
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 700 }}>Mes erreurs</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'hsl(var(--muted))' }}>
        {count} à réviser
        {locked ? <LockIcon /> : <ChevronIcon />}
      </span>
    </Link>
  )
}
