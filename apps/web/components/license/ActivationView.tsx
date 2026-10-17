'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { formatCode, isValidCode } from '@/lib/license/code'
import { FREE_THEME } from '@/lib/license/license'

interface Props {
  themeCount: number
  questionCount: number
  wavePaymentUrl: string // vide → bouton masqué
  supportWhatsapp: string // numéro international sans « + » ; vide → lien masqué
}

type Status = 'idle' | 'invalid' | 'soon'

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

export function ActivationView({ themeCount, questionCount, wavePaymentUrl, supportWhatsapp }: Props) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Session 9 : appel de la fonction d'activation. Aucun code ne débloque pour l'instant.
    setStatus(isValidCode(code) ? 'soon' : 'invalid')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'hsl(var(--bg))', padding: '8px 20px 32px' }}>
      <Link
        href="/"
        aria-label="Retour"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          marginLeft: -12,
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
          `Les ${themeCount} thèmes du programme (${questionCount} questions)`,
          'Examens blancs illimités',
          'Révision de tes erreurs',
        ].map((item) => (
          <li key={item} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'hsl(var(--text))', lineHeight: 1.4 }}>
            <span aria-hidden style={{ color: 'hsl(var(--success))', fontWeight: 700 }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 13, color: 'hsl(var(--muted))', marginTop: 10 }}>
        Version gratuite : thème {FREE_THEME} et 1 examen blanc.
      </p>

      <div style={{
        marginTop: 20,
        padding: '16px',
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'hsl(var(--text))' }}>4&nbsp;900 FCFA</div>
        <div style={{ fontSize: 14, color: 'hsl(var(--muted))', marginBottom: wavePaymentUrl ? 14 : 0 }}>pour 90 jours</div>
        {wavePaymentUrl && (
          <a
            href={wavePaymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...buttonStyle, background: 'hsl(var(--primary))', color: 'hsl(var(--text))' }}
          >
            Payer avec Wave
          </a>
        )}
      </div>

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
          placeholder="GALS-XXXX-XXXX"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={14}
          aria-invalid={status === 'invalid'}
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
          color: status === 'invalid' ? 'hsl(var(--error))' : 'hsl(var(--muted))',
        }}>
          {status === 'invalid' && 'Format attendu : GALS-XXXX-XXXX'}
          {status === 'soon' && 'Activation bientôt disponible.'}
        </p>
        <button
          type="submit"
          style={{ ...buttonStyle, marginTop: 4, background: 'hsl(var(--text))', color: 'hsl(var(--bg))', border: 'none' }}
        >
          Activer
        </button>
        <p style={{ fontSize: 13, color: 'hsl(var(--muted))', marginTop: 10, textAlign: 'center' }}>
          Le code s&apos;active sur un seul téléphone.
        </p>
      </form>

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
