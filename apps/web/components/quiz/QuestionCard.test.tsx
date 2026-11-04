import { describe, it, expect, vi } from 'vitest'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QuestionCard } from './QuestionCard'
import { ExplanationPanel } from './ExplanationPanel'
import type { ChoicePart, Part, QuestionV2 } from '../../lib/quiz/types'

function question(media: QuestionV2['media'], ...parts: Part[]): QuestionV2 {
  return {
    id: 't00-c00-0001',
    theme: 't00',
    chapter: 't00-c00',
    media,
    parts: parts as QuestionV2['parts'],
    explanation: 'Parce que.',
    common_mistake: 'Croire que oui.',
    legal_ref: null,
    legal_status: 'not_regulatory',
    status: 'published',
  }
}

const photo = { kind: 'photo', src: 'p08.webp', alt: 'Piéton', credit: 'CC' } as const
const yes = (correct: 'yes' | 'no'): Part => ({ kind: 'yesno', statement: 'Je peux passer', correct })
const choice: ChoicePart = {
  text: 'Que faire ?',
  options: [
    { id: 'A', text: 'x' },
    { id: 'B', text: 'y' },
    { id: 'C', text: 'z' },
    { id: 'D', text: 'w' },
  ],
  correct: ['B'],
}

const noop = () => {}
function props(q: QuestionV2, over: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  return { question: q, index: 2, total: 10, picked: [], revealed: false, onPick: noop, onSubmit: noop, onNext: noop, ...over }
}
const html = (q: QuestionV2, over = {}) => renderToStaticMarkup(<QuestionCard {...props(q, over)} />)

/** Parcourt l'arbre d'éléments (sans rendre) et renvoie ceux qui satisfont `test`. */
function find(node: ReactNode, test: (el: ReactElement) => boolean, out: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(node)) node.forEach((n) => find(n, test, out))
  else if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>
    if (test(el)) out.push(el)
    find(el.props.children, test, out)
  }
  return out
}

describe('QuestionCard — rendu', () => {
  it('image + bouton agrandir au-dessus de l’énoncé', () => {
    const out = html(question(photo, yes('no')))
    expect(out).toContain('src="/media/p08.webp"')
    expect(out).toContain('aria-label="Agrandir l&#x27;image"')
    expect(out.indexOf('<img')).toBeLessThan(out.indexOf('Je peux passer'))
  })

  it('affiche la phrase de contexte avant l’énoncé', () => {
    const q = { ...question(undefined, yes('no')), context: 'Un piéton traverse devant moi.' }
    const out = html(q)
    expect(out).toContain('Un piéton traverse devant moi.')
    expect(out.indexOf('Un piéton traverse')).toBeLessThan(out.indexOf('Je peux passer'))
  })

  it('yesno : OUI/NON, pas d’options en texte libre', () => {
    const out = html(question(undefined, yes('no')))
    expect(out).toContain('OUI')
    expect(out).toContain('NON')
    expect(out).toContain('data-slot="0:A"')
    expect(out).toContain('data-slot="0:B"')
    expect(out).not.toContain('data-slot="0:C"')
  })

  it('double yesno : cases A B C D', () => {
    const out = html(question(undefined, yes('no'), yes('yes')))
    for (const l of 'ABCD') expect(out).toContain(`aria-label="Case ${l}"`)
  })

  it('choice : 4 options', () => {
    const out = html(question(undefined, choice))
    for (const l of 'ABCD') expect(out).toContain(`aria-label="Case ${l}"`)
    for (const t of ['>x<', '>y<', '>z<', '>w<']) expect(out).toContain(t)
  })

  it('Valider (n/total) grisé tant que rien n’est coché', () => {
    const out = html(question(undefined, yes('no')))
    expect(out).toContain('Valider (3/10)')
    expect(out).toMatch(/<button[^>]*disabled=""[^>]*>Valider \(3\/10\)/)
  })

  it('Valider actif une fois coché', () => {
    const out = html(question(undefined, yes('no')), { picked: [['B']] })
    expect(out).not.toMatch(/disabled=""[^>]*>Valider/)
  })

  it('libellé une / plusieurs réponses', () => {
    expect(html(question(undefined, choice))).toContain('Une seule réponse')
    expect(html(question(undefined, { ...choice, correct: ['A', 'C'] }))).toContain('Plusieurs réponses')
  })

  it('cibles ≥ 44 px (cases du bas)', () => {
    expect(html(question(undefined, yes('no')))).toContain('height:48px')
  })

  it('après validation : bonne réponse + lien Explication, pas encore dépliée', () => {
    const out = html(question(undefined, yes('no')), { picked: [['B']], revealed: true })
    expect(out).toContain('Bonne réponse !')
    expect(out).toContain('Explication')
    expect(out).toContain('aria-expanded="false"')
    expect(out).not.toContain('Parce que.')
    expect(out).toContain('Suivant')
  })

  it('mauvaise réponse', () => {
    expect(html(question(undefined, yes('no')), { picked: [['A']], revealed: true })).toContain('Mauvaise réponse')
  })

  it('dernière question : bouton Résultats', () => {
    const out = html(question(undefined, yes('no')), { index: 9, revealed: true, picked: [['B']] })
    expect(out).toContain('>Résultats<')
    expect(out).not.toContain('Voir les résultats')
  })

  it('le contenu défile au-dessus de la barre du bas (padding-bottom = barre + safe-area)', () => {
    expect(html(question(undefined, yes('no')))).toContain('padding-bottom:calc(148px + env(safe-area-inset-bottom) + 16px)')
  })

  it('réponse manquée : juste mais non cochée = « à cocher », distincte de la bonne réponse cochée', () => {
    const q = question(undefined, yes('no'))
    const missed = html(q, { picked: [['A']], revealed: true })
    expect(missed).toContain('à cocher')
    expect(missed).toContain('line-through') // A cochée et fausse
    const good = html(q, { picked: [['B']], revealed: true })
    expect(good).not.toContain('à cocher')
    expect(good).not.toContain('line-through')
  })

  it('timeout (rien coché) : la bonne réponse est « à cocher », jamais verte pleine', () => {
    const out = html(question(undefined, yes('no')), { picked: [], revealed: true })
    expect(out).toContain('à cocher')
    expect(out).not.toContain('(bonne réponse)') // ni ✓ plein (SR) sur la case non cochée
  })

  it('shuffle actif : pastilles dans l’ordre affiché', () => {
    const out = html(question(undefined, choice), { orders: [['C', 'A', 'D', 'B']] })
    const labels = [...out.matchAll(/>([xyzw])<\/span>/g)].map((m) => m[1])
    expect(labels).toEqual(['z', 'x', 'w', 'y'])
  })
})

describe('QuestionCard — variant exam / correction', () => {
  const q = question(undefined, yes('no'))

  it('exam : Valider sans n/total, ni bannière, ni explication, même si revealed', () => {
    const out = html(q, { variant: 'exam', picked: [['B']], revealed: true })
    expect(out).toContain('>Valider<')
    expect(out).not.toContain('/10')
    expect(out).not.toContain('Bonne réponse')
    expect(out).not.toContain('Explication')
  })

  it('exam : Valider grisé tant que rien coché, Terminer sur la dernière', () => {
    expect(html(q, { variant: 'exam' })).toContain('disabled')
    expect(html(q, { variant: 'exam', index: 9, picked: [['B']] })).toContain('>Terminer<')
  })

  it('correction : pas de Valider, bannière + Explication, croix fermer', () => {
    const out = html(q, { variant: 'correction', picked: [['A']], onClose: noop, onPrev: noop })
    expect(out).not.toContain('Valider')
    expect(out).toContain('Mauvaise réponse')
    expect(out).toContain('Explication')
    expect(out).toContain('Fermer la correction')
    expect(out).toContain('>Précédent<')
    expect(out).toContain('>Suivant<')
  })

  it('correction : Précédent désactivé sur la 1re, Terminer sur la dernière', () => {
    const first = renderToStaticMarkup(<QuestionCard {...props(q, { variant: 'correction', index: 0 })} />)
    expect(first).toMatch(/<button[^>]*disabled[^>]*>Précédent/)
    const last = html(q, { variant: 'correction', index: 39, total: 40 })
    expect(last).toContain('>Terminer<')
    expect(last).not.toMatch(/<button[^>]*disabled[^>]*>Précédent/)
  })

  it('correction sans onClose : pas de croix', () => {
    expect(html(q, { variant: 'correction' })).not.toContain('Fermer la correction')
  })
})

describe('ExplanationPanel — dépliée', () => {
  it('explication, erreur fréquente puis bonnes réponses, dans cet ordre', () => {
    const out = renderToStaticMarkup(
      <ExplanationPanel explanation="Parce que." commonMistake="Croire que oui." answersText="Bonne réponse : D" defaultOpen />,
    )
    expect(out).not.toContain('Quel est le risque')
    const order = ['Explication', 'Parce que.', 'Erreur fréquente :', 'Croire que oui.', 'Bonne réponse : D'].map((t) => out.indexOf(t))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('Bonne réponse affichée avec la lettre de l’écran (shuffle)', () => {
    const q = question(undefined, choice) // bonne = id B
    const out = renderToStaticMarkup(<QuestionCard {...props(q, { picked: [['B']], revealed: true, orders: [['C', 'A', 'D', 'B']] })} />)
    // le panneau est replié : le texte vit dans les props passées au panneau
    const panel = find(QuestionCard(props(q, { picked: [['B']], revealed: true, orders: [['C', 'A', 'D', 'B']] })), (el) => el.type === ExplanationPanel)[0]
    expect((panel.props as { answersText: string }).answersText).toBe('Bonne réponse : D')
    expect(out).toContain('Explication')
  })
})

describe('QuestionCard — lignes de réponse et cases du bas', () => {
  const q = question(undefined, yes('no'), yes('yes'))

  it('les lignes de réponse ne sont pas cliquables : seules les cases du bas cochent', () => {
    const tree = QuestionCard(props(q))
    const options = find(tree, (el) => typeof (el.props as { onSelect?: unknown }).onSelect === 'function')
    expect(options).toHaveLength(0)
    expect(html(q)).toContain('data-line="A"')
  })

  it('une case cochée apparaît cochée en bas et marquée sur sa ligne', () => {
    const out = html(q, { picked: [['A'], []] })
    expect(out).toMatch(/aria-label="Case A" aria-pressed="true"/)
    expect(out).toContain('▶')
  })

  it('les cases du bas appellent onPick avec la partie et l’id', () => {
    const onPick = vi.fn()
    const tree = QuestionCard(props(q, { onPick }))
    const boxes = find(tree, (el) => typeof (el.props as { 'data-slot'?: unknown })['data-slot'] === 'string')
    expect(boxes).toHaveLength(4)
    boxes.forEach((el) => (el.props as { onClick: () => void }).onClick())
    expect(onPick.mock.calls).toEqual([[0, 'A'], [0, 'B'], [1, 'C'], [1, 'D']])
  })

  it('cases du bas de 48 px, grille à 2 colonnes', () => {
    const out = html(q)
    expect(out).toContain('height:48px')
    expect(out).toContain('grid-template-columns:1fr 1fr')
  })
})
