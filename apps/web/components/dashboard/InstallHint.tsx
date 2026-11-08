'use client'

import { useEffect, useState } from 'react'

type InstallEvent = Event & { prompt: () => Promise<void> }
type Mode = 'android' | 'ios' | null

const KEY = 'cg-install-hint-dismissed'

/** Invite à installer l'app : bouton natif sur Android/Chrome, explication en 2 étapes sur iPhone (Safari). */
export function InstallHint() {
  const [mode, setMode] = useState<Mode>(null)
  const [evt, setEvt] = useState<InstallEvent | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return
    } catch {
      // stockage indisponible : on affiche quand même
    }
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return

    const ua = navigator.userAgent
    const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    if (isIos) {
      // Safari seulement : Chrome/Firefox iOS n'offrent pas « Sur l'écran d'accueil » de la même façon
      if (!/CriOS|FxiOS|EdgiOS/.test(ua)) setMode('ios')
      return
    }
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvt(e as InstallEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    setMode(null)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // ignoré
    }
  }

  if (!mode) return null

  return (
    <div
      role="region"
      aria-label="Installer l'application"
      style={{
        margin: '12px 20px 0',
        padding: 14,
        background: 'hsl(var(--surface))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius)',
        fontSize: 14,
        lineHeight: 1.45,
        color: 'hsl(var(--text))',
      }}
    >
      <p style={{ fontWeight: 700 }}>Installe Code Galsen sur ton téléphone</p>
      <p style={{ color: 'hsl(var(--muted))', marginTop: 4 }}>
        {mode === 'ios'
          ? 'Dans Safari : touche Partager, puis « Sur l’écran d’accueil ». L’app marche ensuite sans connexion.'
          : 'Elle s’ouvre en plein écran et marche sans connexion.'}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {mode === 'android' && evt && (
          <button
            type="button"
            onClick={async () => {
              await evt.prompt()
              dismiss()
            }}
            style={{
              minHeight: 44,
              padding: '0 16px',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--text))',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Installer
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          style={{
            minHeight: 44,
            padding: '0 4px',
            border: 'none',
            background: 'transparent',
            color: 'hsl(var(--muted))',
            fontSize: 14,
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  )
}
