import Link from 'next/link'
import type { ReactNode } from 'react'
import { LockIcon } from './Icons'

interface Props {
  icon: ReactNode
  title: string
  note?: string
  href?: string // absent → carte non cliquable (grisée)
  locked?: boolean
}

const BOX = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 8,
  minHeight: 104,
  padding: 14,
  background: 'hsl(var(--surface))',
  border: '1px solid hsl(var(--sand))',
  borderRadius: 'var(--radius)',
  color: 'hsl(var(--ink))',
  textDecoration: 'none',
} as const

/** Une des 4 entrées de l'accueil. Sans `href` : grisée, non cliquable. */
export function HomeCard({ icon, title, note, href, locked }: Props) {
  const body = (
    <>
      <span style={{ color: 'hsl(var(--structure))', display: 'flex' }}>{icon}</span>
      <span>
        <span style={{ display: 'block', fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{title}</span>
        {note && (
          <span style={{ display: 'block', fontSize: 14, color: 'hsl(var(--muted))', marginTop: 2 }}>{note}</span>
        )}
      </span>
      {locked && (
        <span style={{ position: 'absolute', top: 12, right: 12, color: 'hsl(var(--muted))', display: 'flex' }}>
          <LockIcon />
        </span>
      )}
    </>
  )

  if (!href) {
    return (
      <div aria-disabled="true" style={{ ...BOX, background: 'hsl(var(--sand))', opacity: 0.7 }}>
        {body}
      </div>
    )
  }
  return (
    <Link href={href} style={BOX}>
      {body}
    </Link>
  )
}
