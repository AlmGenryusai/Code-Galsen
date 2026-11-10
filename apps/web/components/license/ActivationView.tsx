'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { formatCode, isValidCode } from '@/lib/license/code'
import { FREE_THEME } from '@/lib/license/license'
import { themeTitle } from '@/lib/quiz/taxonomy'
import { activate, type ActivationError } from '@/lib/license/activate'
import { useLicense } from '@/lib/license/use-license'
import { PLANS, formatPrice, planLabel, type Plan } from '@/lib/license/plans'

interface Props {
  themeCount: number
  questionCount: number
  waveUrls: Record<Plan['months'], string> // lien Wave par formule ; vide → commande WhatsApp
  supportWhatsapp: string // numéro international sans « + » ; vide → lien masqué
}

type Status = 'idle' | 'invalid' | 'pending' | ActivationError

const MESSAGES: Partial<Record<Status, string>> = {
  invalid: 'Format attendu : GALS-XXXX-XXXX',
  unknown_code: 'Code inconnu. Vérifie la saisie.',
  already_used: 'Code déjà utilisé sur un autre téléphone. Écris-nous sur WhatsApp (lien ci-dessous).',
  expired: 'Ce code a expiré.',
  network: 'Pas de connexion. Réessaie quand tu as du réseau.',
  server: 'Erreur du serveur. Réessaie plus tard.',
}

function formatDate(expSec: number): string {
  return new Date(expSec * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const buttonStyle = {
  display: 'block',
  width: '100%',
  minHeight: 52,
  padding: '15px 16px',
  borderRadius: 'var(--radius)',
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'var(--font-sans)',
  textAlign: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
} as const

export function ActivationView({ themeCount, questionCount, waveUrls, supportWhatsapp }: Props) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [plan, setPlan] = useState<Plan>(PLANS[PLANS.length - 1])
  const waveUrl = waveUrls[plan.months]
  const orderUrl = supportWhatsapp
    ? `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Bonjour, je veux la formule ${plan.months} mois (${formatPrice(plan.price).replace(/\u00a0/g, ' ')}).`)}`
    : ''
  const [activatedUntil, setActivatedUntil] = useState<number | null>(null)
  const license = useLicense()
  const activeUntil = activatedUntil ?? (license.active ? license.expiresAt : null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'pending') return // anti double-tap
    if (!isValidCode(code)) return setStatus('invalid')
    setStatus('pending')
    const result = await activate(code)
    if (result.ok) {
      setActivatedUntil(result.license.expiresAt)
      setStatus('idle')
    } else {
      setStatus(result.error)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', padding: '8px 20px calc(32px + env(safe-area-inset-bottom))' }}>
      <Link
        href="/"
        aria-label="Retour"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          marginLeft: -14,
          color: 'hsl(var(--muted))',
          fontSize: 22,
          textDecoration: 'none',
        }}
      >
        ‹
      </Link>

      <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, color: 'hsl(var(--text))', marginTop: 4 }}>
        Accès complet
      </h1>
      <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 6, lineHeight: 1.5 }}>
        Pour aller au bout de ta préparation à l&apos;examen du permis B.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          `Les ${themeCount} thèmes du programme (${questionCount} questions)`,
          'Examens blancs illimités',
          'Révision de tes erreurs',
        ].map((item) => (
          <li key={item} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'hsl(var(--text))', lineHeight: 1.4 }}>
            <span aria-hidden style={{ color: 'hsl(var(--success))', fontWeight: 700 }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 10 }}>
        Version gratuite : thème « {themeTitle(FREE_THEME)} » et 1 examen blanc.
      </p>

      <div style={{
        marginTop: 20,
        padding: '16px',
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
      }}>
        <div role="radiogroup" aria-label="Formule" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLANS.map((p) => {
            const selected = p.months === plan.months
            const best = p === PLANS[PLANS.length - 1]
            return (
              <button
                key={p.months}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPlan(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  minHeight: 56,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  border: `${selected ? 2 : 1}px solid hsl(var(${selected ? '--primary-h' : '--border'}))`,
                  background: 'hsl(var(--bg))',
                  color: 'hsl(var(--text))',
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{planLabel(p)}</span>
                  {best && (
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'hsl(var(--success))' }}>
                      Le plus avantageux
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{formatPrice(p.price)}</span>
              </button>
            )
          })}
        </div>
        {(waveUrl || orderUrl) && (
          <a
            href={waveUrl || orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...buttonStyle, marginTop: 14, background: 'hsl(var(--primary))', color: 'hsl(var(--text))' }}
          >
            {waveUrl ? `Payer ${formatPrice(plan.price)} avec Wave` : 'Commander sur WhatsApp'}
          </a>
        )}
        <ol style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            waveUrl
              ? `Paie ${formatPrice(plan.price)} avec Wave.`
              : 'Écris-nous sur WhatsApp, puis paie avec Wave.',
            'Tu reçois ton code sur WhatsApp.',
            'Saisis-le ci-dessous : accès complet tout de suite. La durée démarre à l\u2019activation.',
          ].map((step, i) => (
            <li key={step} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'hsl(var(--text))', lineHeight: 1.4 }}>
              <span aria-hidden style={{
                flex: '0 0 22px', height: 22, borderRadius: 11, background: 'hsl(var(--bg))',
                border: '1px solid hsl(var(--border))', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {activeUntil !== null ? (
        <div role="status" style={{
          marginTop: 24,
          padding: '16px',
          background: 'hsl(var(--success-soft))',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--text))', lineHeight: 1.4 }}>
            Accès complet {activatedUntil !== null ? 'activé' : 'actif'} jusqu&apos;au {formatDate(activeUntil)}.
          </p>
          <Link href="/" style={{ ...buttonStyle, marginTop: 14, background: 'hsl(var(--primary))', color: 'hsl(var(--text))' }}>
            Commencer
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
          <label htmlFor="code" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'hsl(var(--text))', marginBottom: 8 }}>
            Code d&apos;activation
          </label>
          <input
            id="code"
            name="code"
            value={code}
            onChange={(e) => {
              setCode(formatCode(e.target.value))
              setStatus('idle')
            }}
            onFocus={(e) => {
              // Clavier mobile : garde le champ et le bouton visibles
              const el = e.currentTarget
              setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
            }}
            placeholder="GALS-XXXX-XXXX"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={14}
            aria-invalid={status === 'invalid' || status === 'unknown_code'}
            aria-describedby="code-status"
            style={{
              width: '100%',
              height: 48,
              padding: '0 14px',
              fontSize: 18,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              color: 'hsl(var(--text))',
              background: 'hsl(var(--surface))',
              border: `1.5px solid hsl(var(${status === 'invalid' ? '--error' : '--border'}))`,
              borderRadius: 'var(--radius)',
            }}
          />
          <p id="code-status" role="status" style={{
            minHeight: 20,
            marginTop: 6,
            fontSize: 13,
            color: status === 'network' ? 'hsl(var(--muted))' : 'hsl(var(--error))',
          }}>
            {MESSAGES[status]}
          </p>
          <button
            type="submit"
            disabled={status === 'pending'}
            style={{
              ...buttonStyle,
              marginTop: 4,
              background: 'hsl(var(--text))',
              color: 'hsl(var(--bg))',
              border: 'none',
              opacity: status === 'pending' ? 0.6 : 1,
            }}
          >
            {status === 'pending' ? 'Activation…' : 'Activer'}
          </button>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted))', marginTop: 10, textAlign: 'center' }}>
            Le code s&apos;active sur un seul téléphone.
          </p>
        </form>
      )}

      {supportWhatsapp && (
        <a
          href={`https://wa.me/${supportWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            marginTop: 12,
            fontSize: 14,
            fontWeight: 600,
            color: 'hsl(var(--primary-h))',
            textDecoration: 'none',
          }}
        >
          Besoin d&apos;aide ?
        </a>
      )}
    </div>
  )
}
