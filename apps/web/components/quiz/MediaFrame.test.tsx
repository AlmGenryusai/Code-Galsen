import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MediaFrame } from './MediaFrame'
import { SIGNS } from '../sign/signs'
import type { Media } from '../../lib/quiz/types'

const photo: Media = {
  kind: 'photo',
  src: 'rond-point.webp',
  alt: 'Rond-point vu du siège conducteur',
  credit: 'test',
  marker: { x: 30, y: 60 },
  badge: 'moto',
}

describe('MediaFrame', () => {
  it('sans média : rien', () => {
    expect(renderToStaticMarkup(<MediaFrame />)).toBe('')
  })

  it('panneau : SVG sur fond sable, 16:9', () => {
    const id = Object.keys(SIGNS)[0]
    const html = renderToStaticMarkup(<MediaFrame media={{ kind: 'sign', src: id, alt: '', credit: '' }} />)
    expect(html).toContain('<img')
    expect(html).toContain('16 / 9')
    expect(html).toContain('--sand')
  })

  it('photo : chemin /media, lazy, alt', () => {
    const html = renderToStaticMarkup(<MediaFrame media={photo} />)
    expect(html).toContain('src="/media/rond-point.webp"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('alt="Rond-point vu du siège conducteur"')
  })

  it('photo : repère placé en % de l\'image', () => {
    const html = renderToStaticMarkup(<MediaFrame media={photo} />)
    expect(html).toContain('left:30%')
    expect(html).toContain('top:60%')
  })

  it('photo : picto en coin, pas de repère sans marker', () => {
    const html = renderToStaticMarkup(<MediaFrame media={photo} />)
    expect(html).toContain('Moto')
    const bare = renderToStaticMarkup(<MediaFrame media={{ ...photo, marker: undefined, badge: undefined }} />)
    expect(bare).not.toContain('left:')
    expect(bare).not.toContain('Moto')
  })
})
