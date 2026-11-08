'use client'

import { useState } from 'react'

interface ExplanationPanelProps {
  explanation: string
  commonMistake?: string
  answersText: string // « Bonne réponse : D »
  defaultOpen?: boolean
}

/** Lien « Explication » qui déplie : explication, erreur fréquente, bonnes réponses. */
export function ExplanationPanel({ explanation, commonMistake, answersText, defaultOpen = false }: ExplanationPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          minHeight: 48,
          padding: '0 4px',
          background: 'none',
          border: 'none',
          fontSize: 16,
          fontWeight: 700,
          color: 'hsl(var(--structure))',
          textDecoration: 'underline',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Explication {open ? '▴' : '▾'}
      </button>
      {open && (
        <div style={{ fontSize: 15, lineHeight: 1.5, color: 'hsl(var(--ink))' }}>
          {explanation && <p style={{ marginTop: 4 }}>{explanation}</p>}
          {commonMistake && (
            <p style={{ marginTop: 10 }}>
              <strong>Erreur fréquente :</strong> {commonMistake}
            </p>
          )}
          <p style={{ marginTop: 10, fontWeight: 700 }}>{answersText}</p>
        </div>
      )}
    </div>
  )
}
