import Link from 'next/link'

/** Barre fixe avec un bouton orange, et un lien secondaire optionnel. */
export function BottomBar({
  href,
  children,
  secondary,
}: {
  href: string
  children: string
  secondary?: { href: string; label: string }
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 430,
        margin: '0 auto',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        background: 'hsl(var(--bg))',
        borderTop: '1px solid hsl(var(--sand))',
      }}
    >
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--ink))',
          borderRadius: 'var(--radius)',
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {children}
      </Link>
      {secondary && (
        <Link
          href={secondary.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            marginTop: 4,
            color: 'hsl(var(--ink))',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          {secondary.label}
        </Link>
      )}
    </div>
  )
}

/** Hauteur à réserver en bas de page pour ne pas masquer le contenu. */
export const BOTTOM_BAR_SPACE = 'calc(120px + env(safe-area-inset-bottom) + 24px)'
