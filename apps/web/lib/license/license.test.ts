import { describe, it, expect } from 'vitest'
import { ACTIVATE_HREF, FREE_THEME, canAccess, hrefFor, redirectFor, type License } from './license'

const free: License = { active: false, expiresAt: null }
const paid: License = { active: true, expiresAt: 2_000_000_000 }
const freeThemeHref = `/quiz?theme=${encodeURIComponent(FREE_THEME)}`

describe('verrou gratuit / payant', () => {
  it('thème gratuit libre', () => {
    expect(canAccess({ kind: 'theme', theme: FREE_THEME }, free)).toBe(true)
    expect(redirectFor({ kind: 'theme', theme: FREE_THEME }, free)).toBeNull()
  })

  it('thème payant → /activer', () => {
    expect(canAccess({ kind: 'theme', theme: 't01' }, free)).toBe(false)
    expect(redirectFor({ kind: 'theme', theme: 't01' }, free)).toBe(ACTIVATE_HREF)
  })

  it('/quiz sans thème → thème gratuit', () => {
    expect(redirectFor({ kind: 'all' }, free)).toBe(freeThemeHref)
  })

  it('mode erreurs → /activer', () => {
    expect(redirectFor({ kind: 'errors' }, free)).toBe(ACTIVATE_HREF)
  })

  it('1er examen libre, 2e → /activer', () => {
    expect(redirectFor({ kind: 'exam', examsTaken: 0 }, free)).toBeNull()
    expect(redirectFor({ kind: 'exam', examsTaken: 1 }, free)).toBe(ACTIVATE_HREF)
  })

  it('licence active : tout est ouvert', () => {
    expect(redirectFor({ kind: 'theme', theme: 't01' }, paid)).toBeNull()
    expect(redirectFor({ kind: 'all' }, paid)).toBeNull()
    expect(redirectFor({ kind: 'errors' }, paid)).toBeNull()
    expect(redirectFor({ kind: 'exam', examsTaken: 5 }, paid)).toBeNull()
  })

  it('hrefFor : cible si libre, redirection sinon', () => {
    expect(hrefFor({ kind: 'theme', theme: FREE_THEME }, free)).toBe(freeThemeHref)
    expect(hrefFor({ kind: 'errors' }, paid)).toBe('/quiz?mode=erreurs')
    expect(hrefFor({ kind: 'exam', examsTaken: 1 }, free)).toBe(ACTIVATE_HREF)
  })
})
