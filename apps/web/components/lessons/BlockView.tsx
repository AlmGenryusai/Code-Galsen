import type { ReactNode } from 'react'
import { MediaFrame } from '../quiz/MediaFrame'
import type { Block } from '@/lib/lessons/types'

/** **gras** seulement ; tout le reste est du texte brut (React échappe). */
function inline(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}

const BODY = { fontSize: 16, lineHeight: 1.6, color: 'hsl(var(--ink))' } as const

function Callout({ label, text }: { label: string; text: string }) {
  return (
    <aside
      style={{
        background: 'hsl(var(--sand))',
        borderRadius: 'var(--radius)',
        padding: '12px 14px',
        margin: '0 0 16px',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5, color: 'hsl(var(--structure))', marginBottom: 4 }}>
        {label}
      </p>
      <p style={BODY}>{inline(text)}</p>
    </aside>
  )
}

/** Un bloc de fiche. Pas de HTML libre, pas d'animation. */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <h2 style={{ fontSize: 18, fontWeight: 800, color: 'hsl(var(--ink))', margin: '20px 0 6px' }}>{block.text}</h2>
    case 'text':
      return <p style={{ ...BODY, margin: '0 0 16px' }}>{inline(block.text)}</p>
    case 'list':
      return (
        <ul style={{ ...BODY, margin: '0 0 16px', paddingLeft: 22, listStyle: 'disc', listStylePosition: 'outside' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {inline(item)}
            </li>
          ))}
        </ul>
      )
    case 'attention':
      return <Callout label="ATTENTION" text={block.text} />
    case 'memo':
      return <Callout label="AIDE-MÉMOIRE" text={block.text} />
    case 'table':
      return (
        <div style={{ ...BODY, margin: '0 0 16px', border: '1px solid hsl(var(--sand))', borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', background: 'hsl(var(--sand))' }}>
            {block.head.map((h, i) => (
              <div key={i} style={{ padding: '8px 12px', fontWeight: 800, overflowWrap: 'anywhere' }}>
                {h}
              </div>
            ))}
          </div>
          {block.rows.map((row, i) => (
            <div key={i} style={{ borderTop: '1px solid hsl(var(--sand))' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)' }}>
                <div style={{ padding: '8px 12px', fontWeight: 700, overflowWrap: 'anywhere' }}>{row.label}</div>
                <div style={{ padding: '8px 12px', overflowWrap: 'anywhere' }}>{inline(row.text)}</div>
              </div>
              {row.media && <MediaFrame media={row.media} />}
            </div>
          ))}
        </div>
      )
    case 'image':
      return (
        <figure style={{ margin: '0 0 16px' }}>
          <MediaFrame media={block.media} />
          {block.caption && (
            <figcaption style={{ fontSize: 14, lineHeight: 1.4, color: 'hsl(var(--muted))', marginTop: 6 }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
  }
}
