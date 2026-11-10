// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))
import { track as vercelTrack } from '@vercel/analytics'
import { captureUtm, readUtm, shareUrl, trackVisit } from './track'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.mocked(vercelTrack).mockClear()
})

describe('UTM', () => {
  it('direct sans paramètre', () => {
    expect(captureUtm('')).toEqual({ source: 'direct', campagne: '' })
  })

  it('garde la première source (first-touch)', () => {
    captureUtm('?utm_source=tiktok&utm_campaign=lancement')
    captureUtm('?utm_source=whatsapp')
    expect(readUtm()).toEqual({ source: 'tiktok', campagne: 'lancement' })
  })
})

describe('visite', () => {
  it('une seule par session, avec la source', () => {
    trackVisit('?utm_source=autoecole')
    trackVisit('')
    expect(vercelTrack).toHaveBeenCalledTimes(1)
    expect(vercelTrack).toHaveBeenCalledWith('visite', { source: 'autoecole', campagne: '' })
  })
})

it('lien de partage avec UTM', () => {
  expect(shareUrl('https://code-galsen.vercel.app', 'score')).toBe(
    'https://code-galsen.vercel.app/?utm_source=whatsapp&utm_medium=partage&utm_campaign=score',
  )
})
