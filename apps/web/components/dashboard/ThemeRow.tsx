import Link from 'next/link'
import { ChevronIcon, LockIcon } from './Icons'

interface ThemeRowProps {
  title: string
  progress: number // % (0-100) de questions réussies
  questionsTotal: number
  lastSeries?: { score: number; total: number }
  href: string
  locked?: boolean // le lien mène à /activer
}

export function ThemeRow({ title, progress, questionsTotal, lastSeries, href, locked }: ThemeRowProps) {
  return (
    <Link
      href={href}
      aria-label={locked ? `${title} (verrouillé)` : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
        padding: '10px 0',
        borderBottom: '1px solid hsl(var(--sand))',
        textDecoration: 'none',
        color: 'hsl(var(--ink))',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 14, color: 'hsl(var(--muted))', margin: '2px 0 6px' }}>
          {questionsTotal} question{questionsTotal > 1 ? 's' : ''}
        </div>
        <div style={{ height: 4, background: 'hsl(var(--sand))', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{ height: '100%', width: `${progress}%`, background: 'hsl(var(--structure))', borderRadius: 99 }}
          />
        </div>
      </div>
      {lastSeries && (
        <div style={{ fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
          {lastSeries.score} / {lastSeries.total}
        </div>
      )}
      <span aria-hidden style={{ color: 'hsl(var(--muted))', display: 'flex', flexShrink: 0 }}>
        {locked ? <LockIcon /> : <ChevronIcon />}
      </span>
    </Link>
  )
}
