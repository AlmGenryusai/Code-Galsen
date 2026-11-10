'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { BottomNav } from './BottomNav'
import { useLicense } from '@/lib/license/use-license'
import { useProgress } from '@/lib/progress/use-progress'

const CARD: CSSProperties = {
  background: 'hsl(var(--surface))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--radius)',
  padding: 16,
}
const H2: CSSProperties = { fontSize: 14, fontWeight: 700, color: 'hsl(var(--muted))', margin: '24px 0 8px' }
const LINK: CSSProperties = { display: 'flex', alignItems: 'center', minHeight: 44, fontSize: 15, color: 'hsl(var(--text))' }

function formatDate(expSec: number): string {
  return new Date(expSec * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ProfilView({ supportWhatsapp, sheetTotal }: { supportWhatsapp: string; sheetTotal: number }) {
  const license = useLicense()
  const { progress, loaded } = useProgress()

  const answers = Object.values(progress.answers)
  const correct = answers.reduce((s, a) => s + a.correct, 0)
  const wrong = answers.reduce((s, a) => s + a.wrong, 0)
  const rate = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null
  const examsPassed = progress.exams.filter((e) => e.passed).length
  const sheetsRead = Object.keys(progress.lessons).length

  const stats: [string, string][] = [
    ['Questions travaillées', String(answers.length)],
    ['Bonnes réponses', rate === null ? '–' : `${rate} %`],
    ['Examens blancs', `${progress.exams.length} (${examsPassed} réussis)`],
    ['Fiches lues', `${Math.min(sheetsRead, sheetTotal)} / ${sheetTotal}`],
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'hsl(var(--text))' }}>Profil</h1>

        <h2 style={H2}>Mon accès</h2>
        <div style={CARD}>
          {license.loaded && license.active && license.expiresAt !== null ? (
            <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--text))', lineHeight: 1.4 }}>
              Accès complet jusqu&apos;au {formatDate(license.expiresAt)}
            </p>
          ) : (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--text))' }}>Version gratuite</p>
              <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 4, lineHeight: 1.4 }}>
                1 thème et 1 examen blanc. Le code débloque tout pendant 1, 2 ou 3 mois selon la formule.
              </p>
              <Link href="/activer" style={{ ...LINK, color: 'hsl(var(--primary-h))', fontWeight: 600, marginTop: 4 }}>
                Activer un code
              </Link>
            </>
          )}
        </div>

        <h2 style={H2}>Ma progression</h2>
        <div style={CARD}>
          {loaded && stats.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, minHeight: 36, alignItems: 'center', fontSize: 15, color: 'hsl(var(--text))' }}>
              <span>{label}</span>
              <span style={{ fontWeight: 700 }}>{value}</span>
            </div>
          ))}
          <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 8 }}>Enregistrée sur ce téléphone uniquement.</p>
        </div>

        {supportWhatsapp && (
          <>
            <h2 style={H2}>Aide</h2>
            <div style={CARD}>
              <a href={`https://wa.me/${supportWhatsapp}`} target="_blank" rel="noopener noreferrer" style={LINK}>
                Écrire au support sur WhatsApp
              </a>
            </div>
          </>
        )}

        <h2 style={H2}>Informations</h2>
        <nav style={{ ...CARD, padding: '4px 16px' }}>
          <Link href="/mentions-legales" style={LINK}>Mentions légales</Link>
          <Link href="/confidentialite" style={LINK}>Confidentialité</Link>
          <Link href="/credits" style={LINK}>Crédits photos</Link>
        </nav>
      </div>
      <BottomNav />
    </div>
  )
}
