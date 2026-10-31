import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', color: 'hsl(var(--text))', padding: '16px 20px 48px', maxWidth: 640, margin: '0 auto', fontSize: 15, lineHeight: 1.6 }}>
      <Link href="/profil" style={{ display: 'inline-block', minHeight: 44, lineHeight: '44px', color: 'hsl(var(--muted))', fontSize: 14 }}>← Profil</Link>
      <h1 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 16px' }}>{title}</h1>
      {children}
    </main>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 6px' }}>{children}</h2>
}
