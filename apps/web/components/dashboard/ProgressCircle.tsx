import { memo } from 'react'

interface ProgressCircleProps {
  percent: number
  size?: number
  strokeWidth?: number
  label: string
  value: string
  sublabel: string
}

export const ProgressCircle = memo(function ProgressCircle({
  percent,
  size = 36,
  strokeWidth = 3,
  label,
  value,
  sublabel,
}: ProgressCircleProps) {
  const r = (size - strokeWidth * 2) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const dash = (percent / 100) * circumference

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'hsl(var(--surface))',
      borderRadius: 14,
      padding: '10px 14px',
      border: '1px solid hsl(var(--border))',
      boxShadow: 'var(--shadow-1)',
    }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'hsl(var(--muted))', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: 'hsl(var(--text))' }}>
          {value}<span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--muted))' }}>%</span>
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--muted-2))', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
})
