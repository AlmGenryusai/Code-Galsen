// P02: chip secondaire "À réviser" sous ExamScoreCard
interface ReviewChipProps {
  count: number
  href?: string
}

export function ReviewChip({ count, href = '/quiz?mode=srs' }: ReviewChipProps) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px 14px',
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-1)',
        textDecoration: 'none',
        color: 'hsl(var(--text))',
        minHeight: 60,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginTop: 4 }}>À réviser</div>
    </a>
  )
}
