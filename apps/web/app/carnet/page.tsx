export default function CarnetPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12, padding: '0 24px', background: 'hsl(var(--bg))' }}>
      <span style={{ fontSize: 32 }}>📖</span>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'hsl(var(--text))' }}>Carnet d'erreurs</h1>
      <p style={{ fontSize: 14, color: 'hsl(var(--muted))', textAlign: 'center' }}>
        Tes questions ratées apparaîtront ici après tes quiz.
      </p>
    </main>
  )
}
