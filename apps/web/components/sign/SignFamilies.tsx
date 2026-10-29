'use client'

import Link from 'next/link'
import { LessonHeader } from '../lessons/LessonHeader'
import { LockIcon } from '../dashboard/Icons'
import { RoadSign } from './RoadSign'
import { SIGNS } from './signs'
import { FAMILIES } from './families'
import { ACTIVATE_HREF } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'

/** /panneaux : les panneaux par famille, nom dessous. Une famille gratuite, le reste avec la licence. */
export function SignFamilies() {
  const license = useLicense()
  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))' }}>
      <LessonHeader title="Panneaux" backHref="/" />
      <main style={{ padding: '8px 20px 24px' }}>
        {FAMILIES.map((f) => {
          // Avant chargement de la licence : tout affiché (hors ligne, pas de saut)
          const locked = license.loaded && !license.active && !f.free
          return (
            <section key={f.id}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'hsl(var(--ink))', margin: '20px 0 8px' }}>{f.title}</h2>
              {locked ? (
                <Link
                  href={ACTIVATE_HREF}
                  aria-label={`${f.title} (verrouillé)`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, color: 'hsl(var(--muted))', textDecoration: 'none' }}
                >
                  <LockIcon />
                  <span>{f.items.length} panneaux avec l&apos;accès complet</span>
                </Link>
              ) : (
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px 12px', padding: 0, margin: 0, listStyle: 'none' }}>
                  {f.items.map((id) => (
                    <li key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <RoadSign id={id} size={88} />
                      <p style={{ fontSize: 15, lineHeight: 1.4, color: 'hsl(var(--ink))', marginTop: 6, overflowWrap: 'anywhere' }}>{SIGNS[id].label}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
