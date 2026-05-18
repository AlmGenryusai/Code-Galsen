'use client'

import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Parcours',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" color={active ? 'hsl(var(--primary-h))' : 'hsl(var(--muted))'}>
        <path d="M3 8.5L11 3l8 5.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z"
          stroke="currentColor" strokeWidth={1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/quiz',
    label: 'Quiz',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" color={active ? 'hsl(var(--primary-h))' : 'hsl(var(--muted))'}>
        <rect x="3" y="3" width="16" height="16" rx="4"
          stroke="currentColor" strokeWidth={1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
        <path d="M8 11h6M8 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="7.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/carnet',
    label: 'Carnet',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" color={active ? 'hsl(var(--primary-h))' : 'hsl(var(--muted))'}>
        <path d="M5 3h12a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="currentColor" strokeWidth={1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
        <path d="M8 8h6M8 11.5h6M8 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" color={active ? 'hsl(var(--primary-h))' : 'hsl(var(--muted))'}>
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth={1.75} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
        <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
          stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'hsl(var(--surface))',
      boxShadow: '0 -1px 0 hsl(var(--border))',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
    }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: active ? '12px 0 14px' : '13px 0 14px',
              color: active ? 'hsl(var(--text))' : 'hsl(var(--muted))',
              textDecoration: 'none',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
              fontWeight: active ? 700 : 400,
              borderTop: active ? '2px solid hsl(var(--primary-h))' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {item.icon(active)}
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
