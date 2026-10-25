import Link from 'next/link'

/** En-tête vert avec flèche retour. */
export function LessonHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <header
      style={{
        background: 'hsl(var(--structure))',
        color: 'hsl(var(--bg))',
        padding: '4px 16px 0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Link
        href={backHref}
        aria-label="Retour"
        style={{
          color: 'inherit',
          textDecoration: 'none',
          fontSize: 28,
          lineHeight: 1,
          minWidth: 44,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ‹
      </Link>
      <h1 style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{title}</h1>
    </header>
  )
}
