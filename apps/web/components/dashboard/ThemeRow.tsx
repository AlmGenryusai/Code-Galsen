interface ThemeRowProps {
  icon: string
  color: string
  title: string
  progress: number
  questionsTotal: number
  href?: string
}

export function ThemeRow({ icon, color, title, progress, questionsTotal, href }: ThemeRowProps) {
  return (
    <a
      href={href ?? '#'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--stroke)',
        textDecoration: 'none',
        color: 'inherit',
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
        fontFamily: 'var(--serif)',
        fontWeight: 600,
        fontSize: 16,
        flexShrink: 0,
        color: '#fff',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ height: 4, background: 'var(--stroke)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 80 ? 'var(--amber)' : 'var(--terra)',
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontFamily: 'var(--mono)', opacity: 0.55, flexShrink: 0 }}>
        {progress}%
      </div>
      <div style={{ fontSize: 18, opacity: 0.25, fontFamily: 'var(--serif)' }}>›</div>
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
      borderBottom: '1px solid var(--stroke)',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: 'var(--surface2)', borderRadius: 6, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99 }} />
      </div>
    </div>
  )
}
