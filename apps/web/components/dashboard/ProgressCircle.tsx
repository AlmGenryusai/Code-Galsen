interface ProgressCircleProps {
  percent: number
  size?: number
  strokeWidth?: number
  label: string
  value: string
  sublabel: string
}

export function ProgressCircle({
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--surface)',
        borderRadius: 14,
        padding: '14px 16px',
        border: '1px solid var(--stroke)',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(244,237,227,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--amber)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text)' }}>
          {value}<span style={{ fontSize: 14, opacity: 0.55 }}>%</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.45, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}
