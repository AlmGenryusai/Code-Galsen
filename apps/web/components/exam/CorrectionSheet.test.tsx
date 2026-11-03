import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CorrectionSheet } from './CorrectionSheet'
import { stepCorrection } from '../../lib/quiz/exam'
import type { ExamAnswer } from './ExamDebrief'
import type { QuestionV2 } from '../../lib/quiz/types'

const questions: QuestionV2[] = Array.from({ length: 40 }, (_, i) => ({
  id: `t00-c00-${String(i + 1).padStart(4, '0')}`,
  theme: 't00',
  chapter: 't00-c00',
  parts: [{ kind: 'yesno', statement: `Énoncé ${i + 1}`, correct: 'no' }],
  explanation: 'Parce que.',
  common_mistake: 'Croire que oui.',
  legal_ref: null,
  legal_status: 'not_regulatory',
  status: 'published',
}))
const answer = (over: Partial<ExamAnswer> = {}): ExamAnswer => ({ picked: [['B']], correct: true, timedOut: false, ...over })
const answers = questions.map(() => answer())

const sheet = (index: number, list = answers) =>
  renderToStaticMarkup(<CorrectionSheet questions={questions} answers={list} index={index} onStep={() => {}} onClose={() => {}} />)

describe('CorrectionSheet', () => {
  it('« Temps écoulé » affiché quand la question a expiré, sinon rien', () => {
    const timedOut = answers.map((a, i) => (i === 3 ? answer({ picked: [], correct: false, timedOut: true }) : a))
    expect(sheet(3, timedOut)).toContain('Temps écoulé')
    expect(sheet(3, timedOut)).toContain('à cocher') // rien coché : la bonne réponse est à cocher
    expect(sheet(2, timedOut)).not.toContain('Temps écoulé')
  })

  it('Précédent / Suivant traversent les 40 questions, bornes comprises', () => {
    let i: number | null = 0
    const seen: string[] = []
    while (i !== null) {
      const out = sheet(i)
      expect(out).toContain(`${i + 1} / 40`)
      expect(out).toContain(`Énoncé ${i + 1}`)
      seen.push(out)
      i = stepCorrection(i, 40, 1)
    }
    expect(seen).toHaveLength(40)
    expect(seen[0]).toMatch(/<button[^>]*disabled[^>]*>Précédent/)
    expect(seen[39]).toContain('>Terminer<')
    expect(seen[20]).toContain('>Suivant<')
  })

  it('croix fermer toujours présente', () => {
    expect(sheet(0)).toContain('Fermer la correction')
    expect(sheet(39)).toContain('Fermer la correction')
  })

  it('ancienne réponse sans orders : ordre du JSON, aucun plantage', () => {
    const old = answers.map(({ picked, correct, timedOut }) => ({ picked, correct, timedOut })) // pas de champ orders
    expect(() => sheet(0, old)).not.toThrow()
    expect(sheet(0, old)).toContain('Bonne réponse')
  })
})
