interface ThemeRowProps {
  icon: string
  color: string
  title: string
  progress: number
  questionsTotal: number
  href?: string
  locked?: boolean // réservé à l'accès complet : le lien mène à /activer
}

export function ThemeRow({ icon, color, title, progress, questionsTotal, href, locked }: ThemeRowProps) {
  return (
    <a
      href={href ?? '#'}
      aria-label={locked ? `${title} (verrouillé)` : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid hsl(var(--border))',
        textDecoration: 'none',
        color: 'hsl(var(--text))',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#fff',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ height: 4, background: 'hsl(var(--border))', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 80 ? 'hsl(var(--success))' : 'hsl(var(--primary))',
            borderRadius: 99,
          }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-2))', flexShrink: 0 }}>
        {progress}%
      </div>
      <div aria-hidden style={{ fontSize: locked ? 14 : 16, color: 'hsl(var(--muted-2))', opacity: 0.6 }}>
        {locked ? '🔒' : '›'}
      </div>
    </a>
  )
}

export function ThemeRowSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid hsl(var(--border))',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'hsl(var(--surface-2))', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: 'hsl(var(--surface-2))', borderRadius: 6, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 4, background: 'hsl(var(--surface-2))', borderRadius: 99 }} />
      </div>
    </div>
  )
}
