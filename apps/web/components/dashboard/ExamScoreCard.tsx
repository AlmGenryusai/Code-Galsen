// P02: ExamScore hero plein-largeur — indicateur de réassurance principal
interface ExamScoreCardProps {
  score: number | null
  href?: string
}

export function ExamScoreCard({ score, href = '/quiz?mode=examen' }: ExamScoreCardProps) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        padding: '0 16px',
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-2)',
        textDecoration: 'none',
        color: 'hsl(var(--text))',
        gap: 16,
      }}
    >
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'hsl(var(--muted))',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          Tu serais reçu
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--muted-2))' }}>
          Calculé sur tes 5 derniers examens blancs
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
        <span style={{
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1,
          color: score === null
            ? 'hsl(var(--muted))'
            : score >= 80
              ? 'hsl(var(--success))'
              : score >= 60
                ? 'hsl(var(--text))'
                : 'hsl(var(--error))',
        }}>
          {score ?? '—'}
        </span>
        {score !== null && (
          <span style={{ fontSize: 20, fontWeight: 600, color: 'hsl(var(--muted))' }}>%</span>
        )}
      </div>
    </a>
  )
}
