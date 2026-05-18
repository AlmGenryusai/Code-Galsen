import { BottomNav } from '@/components/dashboard/BottomNav'

export default function ProfilPage() {
  return (
    <main style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', paddingBottom: 80 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100dvh - 80px)',
        gap: 12,
        padding: '0 24px',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'hsl(var(--text))' }}>Profil</h1>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted))', textAlign: 'center' }}>
          Tes statistiques et paramètres arrivent bientôt.
        </p>
      </div>
      <BottomNav />
    </main>
  )
}
