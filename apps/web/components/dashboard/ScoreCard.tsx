import { cn } from '@/lib/utils'

interface ScoreCardProps {
  value: string | number
  label: string
  variant?: 'default' | 'accent' | 'warning'
  href?: string
}

export function ScoreCard({ value, label, variant = 'default', href }: ScoreCardProps) {
  const inner = (
    <div
      className={cn('score-card', variant)}
      style={{
        background: variant === 'accent' ? 'rgba(249,176,51,0.12)' : 'var(--surface)',
        border: `1px solid ${variant === 'accent' ? 'rgba(245,176,51,0.3)' : 'var(--stroke)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        position: 'relative',
        cursor: href ? 'pointer' : 'default',
        flex: 1,
        minWidth: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 12,
        right: 14,
        fontSize: 18,
        opacity: 0.3,
        fontFamily: 'var(--serif)',
      }}>›</span>
      <div style={{
        fontFamily: 'var(--serif)',
        fontSize: 30,
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: variant === 'accent' ? 'var(--amber)' : 'var(--text)',
      }}>
        {typeof value === 'number' && value < 100 ? (
          <>{value}<span style={{ fontSize: 14, opacity: 0.6 }}>%</span></>
        ) : value}
      </div>
      <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4, fontFamily: 'var(--sans)' }}>
        {label}
      </div>
    </div>
  )

  if (href) {
    return <a href={href} style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>{inner}</a>
  }
  return inner
}
