import { describe, expect, it } from 'vitest'
import { generateCodes } from '../../../../scripts/generate-codes.mjs'
import { isValidCode } from './code'

describe('generateCodes', () => {
  it('renvoie le nombre demandé de codes valides pour CODE_RE', () => {
    const codes = generateCodes(50)
    expect(codes).toHaveLength(50)
    for (const code of codes) expect(isValidCode(code)).toBe(true)
  })

  it('n’utilise aucun caractère ambigu (0, O, 1, I, L)', () => {
    for (const code of generateCodes(500)) {
      expect(code.slice(5)).not.toMatch(/[01OIL]/)
    }
  })

  it('ne produit aucun doublon sur 500 codes', () => {
    const codes = generateCodes(500)
    expect(new Set(codes).size).toBe(500)
  })

  it('retire les doublons même si le tirage en produit', () => {
    let calls = 0
    // les 2 premiers codes sont identiques (16 tirages constants), puis ça varie
    const rand = (max: number) => (calls++ < 16 ? 0 : calls % max)
    const codes = generateCodes(3, rand)
    expect(new Set(codes).size).toBe(3)
  })
})
