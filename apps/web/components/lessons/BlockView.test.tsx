import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BlockView } from './BlockView'
import { SheetBlocks } from './SheetBlocks'
import type { Block, Sheet } from '@/lib/lessons/types'

const html = (b: Block) => renderToStaticMarkup(<BlockView block={b} />)
const photo = { kind: 'photo' as const, src: 'a.webp', alt: 'Une moto', credit: 'Alfred' }

describe('BlockView', () => {
  it('text : **gras** en <strong>, rien d’autre', () => {
    expect(html({ type: 'text', text: 'Je **ralentis** tôt' })).toContain('Je <strong>ralentis</strong> tôt')
  })

  it('pas de HTML libre : balises échappées', () => {
    const out = html({ type: 'text', text: '<script>alert(1)</script> <b>x</b>' })
    expect(out).not.toContain('<script>')
    expect(out).not.toContain('<b>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('heading, list', () => {
    expect(html({ type: 'heading', text: 'La règle' })).toContain('<h2')
    const list = html({ type: 'list', items: ['a', 'b **c**'] })
    expect(list.match(/<li/g)).toHaveLength(2)
    expect(list).toContain('list-style:disc')
    expect(list).toContain('<strong>c</strong>')
  })

  it('attention et memo : étiquettes', () => {
    expect(html({ type: 'attention', text: 'x' })).toContain('ATTENTION')
    expect(html({ type: 'memo', text: 'x' })).toContain('AIDE-MÉMOIRE')
  })

  it('table : 2 colonnes, pas de défilement horizontal', () => {
    const out = html({ type: 'table', head: ['Cas', 'Je fais'], rows: [{ label: 'Nuit', text: 'Je ralentis' }] })
    expect(out).toContain('Cas')
    expect(out).toContain('Je ralentis')
    expect(out).toContain('minmax(0,2fr) minmax(0,3fr)')
    expect(out).not.toContain('overflow-x')
    expect(out).not.toContain('<table')
  })

  it('image : média et légende', () => {
    const out = html({ type: 'image', media: photo, caption: 'Une Jakarta' })
    expect(out).toContain('alt="Une moto"')
    expect(out).toContain('Une Jakarta')
  })

  it('image sans légende : pas de figcaption', () => {
    expect(html({ type: 'image', media: photo })).not.toContain('figcaption')
  })
})

describe('fiche sans média (cas des f01)', () => {
  const sheet: Sheet = {
    id: 't04-c01-f01',
    title: 'Piétons : la règle de base',
    blocks: [
      { type: 'heading', text: 'La règle' },
      { type: 'text', text: 'Je cède le passage.' },
      { type: 'heading', text: 'Le piège' },
      { type: 'text', text: 'Garder sa vitesse.' },
    ],
  }

  it('affiche tous les textes, sans image, table, ni cadre média vide', () => {
    const out = renderToStaticMarkup(<SheetBlocks sheet={sheet} />)
    for (const t of ['La règle', 'Je cède le passage.', 'Le piège', 'Garder sa vitesse.']) expect(out).toContain(t)
    expect(out).not.toContain('<img')
    expect(out).not.toContain('<figure')
    expect(out).not.toContain('aspect-ratio')
    expect(out).not.toContain('ATTENTION')
  })
})
