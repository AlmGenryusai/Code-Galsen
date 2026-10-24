import { afterEach, describe, expect, it, vi } from 'vitest'
import { activate } from './activate'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('activate — hors ligne', () => {
  it('hors ligne sans URL Supabase → network (pas server)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubGlobal('navigator', { onLine: false })
    expect(await activate('GALS-7K3P-9QXM')).toEqual({ ok: false, error: 'network' })
  })

  it('en ligne sans URL Supabase → server', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubGlobal('navigator', { onLine: true })
    expect(await activate('GALS-7K3P-9QXM')).toEqual({ ok: false, error: 'server' })
  })
})
