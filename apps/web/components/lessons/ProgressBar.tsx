/** Barre de progression simple, sans animation. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{ height: 6, background: 'hsl(var(--sand))', borderRadius: 3, overflow: 'hidden' }}
    >
      <div style={{ width: `${max ? (value / max) * 100 : 0}%`, height: '100%', background: 'hsl(var(--structure))' }} />
    </div>
  )
}
