'use client'

import Link from 'next/link'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { EXAM_CONFIG } from '@/lib/quiz/exam-config'
import type { CarnetData } from '@/lib/carnet/mock-carnet'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

interface Props {
  data: CarnetData
}

export function CarnetView({ data }: Props) {
  const { examAttempts, weakThemes } = data
  const last = examAttempts[0] ?? null
  const recent = examAttempts.slice(0, 3)
  const avgScore = recent.length > 0
    ? Math.round(recent.reduce((s, a) => s + a.score, 0) / recent.length)
    : null

  if (examAttempts.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 12 }}>
        <p style={{ fontSize: 14, color: 'hsl(var(--muted))', textAlign: 'center', lineHeight: 1.6 }}>
          Aucun examen réalisé.{'\n'}Lance ton premier examen pour voir tes résultats ici.
        </p>
        <Link href="/examen" style={{
          marginTop: 8,
          padding: '14px 32px',
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--text))',
          borderRadius: 'var(--radius)',
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          width: '100%',
          maxWidth: 320,
        }}>
          Commencer un examen →
        </Link>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ background: 'hsl(var(--bg))', minHeight: '100dvh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 0' }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: 'hsl(var(--text))' }}>Progression</h1>
      </div>

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Dernière session */}
        {last && (
          <div style={{
            background: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Dernier examen · {formatDate(last.date)}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{
                fontSize: 44,
                fontWeight: 800,
                lineHeight: 1,
                color: last.passed ? 'hsl(var(--success))' : 'hsl(var(--error))',
              }}>
                {last.score}%
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: last.passed ? 'hsl(var(--success))' : 'hsl(var(--error))',
              }}>
                {last.passed ? 'Réussi' : 'Échoué'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'hsl(var(--muted))', marginTop: 4 }}>
              {last.faults} faute{last.faults !== 1 ? 's' : ''} · {last.total - last.faults}/{last.total} correctes
            </div>
          </div>
        )}

        {/* Stats rapides 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            background: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'hsl(var(--text))', lineHeight: 1 }}>
              {examAttempts.length}
            </div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginTop: 4 }}>
              examen{examAttempts.length > 1 ? 's' : ''} réalisé{examAttempts.length > 1 ? 's' : ''}
            </div>
          </div>
          <div style={{
            background: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1,
              color: avgScore !== null && avgScore >= EXAM_CONFIG.passThresholdPct
                ? 'hsl(var(--success))'
                : 'hsl(var(--text))',
            }}>
              {avgScore ?? '—'}%
            </div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginTop: 4 }}>
              taux moyen récent
            </div>
          </div>
        </div>

        {/* Thèmes à revoir */}
        {weakThemes.length > 0 && (
          <div style={{
            background: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted))', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Thèmes à revoir
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weakThemes.map(t => (
                <div key={t.themeId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'hsl(var(--text))' }}>
                      {t.label}
                    </span>
                    <span style={{ fontSize: 12, color: t.errorRate > 0.5 ? 'hsl(var(--error))' : 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }}>
                      {Math.round(t.errorRate * 100)}% de fautes
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'hsl(var(--border))', borderRadius: 99 }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round(t.errorRate * 100)}%`,
                      background: t.errorRate > 0.5 ? 'hsl(var(--error))' : 'hsl(var(--muted))',
                      borderRadius: 99,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link href="/quiz" style={{
          display: 'block',
          padding: '16px',
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--text))',
          borderRadius: 'var(--radius)',
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          textAlign: 'center',
        }}>
          Reprendre un entraînement →
        </Link>

      </div>

      <BottomNav />
    </div>
  )
}
