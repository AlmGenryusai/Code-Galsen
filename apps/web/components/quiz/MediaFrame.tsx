import { RoadSign } from '../sign/RoadSign'
import type { Media } from '../../lib/quiz/types'

const BADGE_LABEL: Record<NonNullable<Media['badge']>, string> = {
  moto: 'Moto',
  pieton: 'Piéton',
  charrette: 'Charrette',
  bus: 'Bus',
  camion: 'Camion',
  animal: 'Animal',
}

/** Zone média 16:9 pleine largeur : panneau SVG sur sable, ou photo avec repère et picto. Pas de média : rien. */
export function MediaFrame({ media }: { media?: Media }) {
  if (!media) return null

  if (media.kind === 'sign') {
    return (
      <div style={{ aspectRatio: '16 / 9', width: '100%', background: 'hsl(var(--sand))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoadSign id={media.src} size={96} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%', background: 'hsl(var(--sand))', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/media/${media.src}`}
        alt={media.alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {media.marker && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${media.marker.x}%`,
            top: `${media.marker.y}%`,
            width: 44,
            height: 44,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '3px solid #fff',
            boxShadow: '0 0 0 2px hsl(var(--ink))',
            pointerEvents: 'none',
          }}
        />
      )}
      {media.badge && (
        <span style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 99, background: 'hsl(var(--ink))', color: '#fff', fontSize: 14, fontWeight: 700 }}>
          {BADGE_LABEL[media.badge]}
        </span>
      )}
    </div>
  )
}
