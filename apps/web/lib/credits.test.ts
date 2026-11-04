import { describe, expect, it } from 'vitest'
import { getPhotoCredits } from './credits'

describe('crédits photos', () => {
  const credits = getPhotoCredits()
  it('liste chaque photo une fois, avec un crédit', () => {
    expect(credits.length).toBeGreaterThan(0)
    expect(new Set(credits.map((c) => c.src)).size).toBe(credits.length)
    for (const c of credits) expect(c.credit.trim().length).toBeGreaterThan(0)
  })
})
