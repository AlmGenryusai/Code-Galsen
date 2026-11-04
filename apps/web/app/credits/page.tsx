import { LegalPage } from '@/components/LegalPage'
import { getPhotoCredits } from '@/lib/credits'

export const metadata = { title: 'Crédits photos — Code Galsen' }

export default function CreditsPage() {
  const credits = getPhotoCredits()
  return (
    <LegalPage title="Crédits photos">
      <p>Les photos proviennent de Wikimedia Commons et sont utilisées sous leurs licences d&apos;origine. Les panneaux sont des illustrations de l&apos;application.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
        {credits.map((c) => (
          <li key={c.src} style={{ padding: '8px 0', borderTop: '1px solid hsl(var(--border, var(--muted) / 0.3))', fontSize: 14 }}>
            <span style={{ display: 'block' }}>{c.alt}</span>
            <span style={{ display: 'block', color: 'hsl(var(--muted))', fontSize: 13 }}>{c.credit}</span>
          </li>
        ))}
      </ul>
    </LegalPage>
  )
}
