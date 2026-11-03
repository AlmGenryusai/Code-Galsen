'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaFrame } from './MediaFrame'
import { RoadSign } from '../sign/RoadSign'
import type { Media } from '../../lib/quiz/types'

const CLOSE_STYLE = {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.92)',
  color: '#1F1B16',
  fontSize: 24,
  lineHeight: 1,
} as const

/** MediaFrame + bouton plein écran. Overlay `fixed` simple (pas de <dialog> : anciens WebView Android / Safari < 15.4). */
export function ZoomableMedia({ media }: { media?: Media }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!media) return null

  return (
    <div style={{ position: 'relative' }}>
      <MediaFrame media={media} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agrandir l'image"
        style={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius)',
          border: 'none',
          background: 'rgba(31,27,22,0.72)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={media.alt}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {media.kind === 'sign' ? (
            <div style={{ background: 'hsl(var(--sand))', padding: 32, borderRadius: 'var(--radius)' }}>
              <RoadSign id={media.src} size={240} />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/media/${media.src}`} alt={media.alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Fermer" style={CLOSE_STYLE}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
