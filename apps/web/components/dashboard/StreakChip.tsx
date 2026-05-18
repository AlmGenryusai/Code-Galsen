// P02: chip secondaire "Streak" sous ExamScoreCard
interface StreakChipProps {
  days: number
}

export function StreakChip({ days }: StreakChipProps) {
  const active = days >= 3

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px 14px',
        background: active ? 'hsl(var(--warn-soft))' : 'hsl(var(--surface))',
        border: `1px solid ${active ? 'hsl(var(--warn))' : 'hsl(var(--border))'}`,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-1)',
        minHeight: 60,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--text))' }}>
        {days}×
      </div>
      <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginTop: 4 }}>
        {active ? 'Série en cours 🔥' : days === 1 ? 'Premier jour' : 'Jours de suite'}
      </div>
    </div>
  )
}
