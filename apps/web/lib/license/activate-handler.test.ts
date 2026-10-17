import { describe, it, expect, beforeEach } from 'vitest'
import { webcrypto } from 'node:crypto'
import { handle, type Deps, type LicenseRow } from '../../../../supabase/functions/activate/handler'

const ORIGIN = 'http://localhost:3000'
const NOW = new Date('2026-10-18T12:00:00Z')
const DAY = 86_400
const DEV_A = 'a'.repeat(32)
const DEV_B = 'b'.repeat(32)
const CODE = 'GALS-7K3P-9QXM'

const keys = (await webcrypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair

let rows: Map<string, LicenseRow>
let raceWinner: string | null // simule un autre téléphone qui lie le code juste avant le PATCH

function deps(): Deps {
  return {
    async getLicense(code) {
      const r = rows.get(code)
      return r ? { ...r } : null
    },
    async bindDevice(code, deviceId, activatedAt, expiresAt) {
      const r = rows.get(code)
      if (raceWinner && r) r.device_id = raceWinner
      if (!r || r.device_id !== null) return false
      rows.set(code, { ...r, device_id: deviceId, activated_at: activatedAt, expires_at: expiresAt })
      return true
    },
    async sign(message) {
      return new Uint8Array(await webcrypto.subtle.sign('Ed25519', keys.privateKey, message))
    },
    now: () => NOW,
    allowedOrigins: [ORIGIN],
  }
}

function post(body: unknown, origin = ORIGIN) {
  return handle(
    new Request('https://x.supabase.co/functions/v1/activate', {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    deps(),
  )
}

function payloadOf(license: string) {
  const b64 = license.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
}

beforeEach(() => {
  rows = new Map([[CODE, { code: CODE, device_id: null, activated_at: null, expires_at: null }]])
  raceWinner = null
})

describe('fonction activate', () => {
  it('code inconnu → 404', async () => {
    const res = await post({ code: 'GALS-AAAA-BBBB', deviceId: DEV_A })
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'unknown_code' })
  })

  it('code libre → lié à l’appareil, 90 jours, licence signée valide', async () => {
    const res = await post({ code: 'gals-7k3p-9qxm', deviceId: DEV_A })
    expect(res.status).toBe(200)
    const { license } = await res.json()
    const exp = Math.floor(NOW.getTime() / 1000) + 90 * DAY
    expect(payloadOf(license)).toEqual({ code: CODE, deviceId: DEV_A, exp })
    expect(rows.get(CODE)?.device_id).toBe(DEV_A)

    const [payload, sig] = license.split('.')
    const ok = await webcrypto.subtle.verify(
      'Ed25519',
      keys.publicKey,
      Buffer.from(sig, 'base64url'),
      new TextEncoder().encode(payload),
    )
    expect(ok).toBe(true)
  })

  it('même appareil → même licence (même exp)', async () => {
    const first = await (await post({ code: CODE, deviceId: DEV_A })).json()
    const again = await post({ code: CODE, deviceId: DEV_A })
    expect(again.status).toBe(200)
    expect(payloadOf((await again.json()).license)).toEqual(payloadOf(first.license))
  })

  it('autre appareil → 409', async () => {
    await post({ code: CODE, deviceId: DEV_A })
    const res = await post({ code: CODE, deviceId: DEV_B })
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'already_used' })
  })

  it('course perdue contre un autre téléphone → 409', async () => {
    raceWinner = DEV_B
    const res = await post({ code: CODE, deviceId: DEV_A })
    expect(res.status).toBe(409)
  })

  it('course « perdue » contre le même téléphone (double envoi) → licence', async () => {
    raceWinner = DEV_A
    rows.set(CODE, { ...rows.get(CODE)!, expires_at: '2026-12-01T00:00:00Z' })
    const res = await post({ code: CODE, deviceId: DEV_A })
    expect(res.status).toBe(200)
  })

  it('transfert manuel (device_id remis à null) → garde la date de fin', async () => {
    rows.set(CODE, { code: CODE, device_id: null, activated_at: '2026-10-01T00:00:00Z', expires_at: '2026-12-30T00:00:00Z' })
    const { license } = await (await post({ code: CODE, deviceId: DEV_B })).json()
    expect(payloadOf(license).exp).toBe(Date.parse('2026-12-30T00:00:00Z') / 1000)
  })

  it('code expiré → 410', async () => {
    rows.set(CODE, { code: CODE, device_id: DEV_A, activated_at: '2026-01-01T00:00:00Z', expires_at: '2026-04-01T00:00:00Z' })
    const res = await post({ code: CODE, deviceId: DEV_A })
    expect(res.status).toBe(410)
  })

  it.each([
    ['JSON invalide', '{oops'],
    ['code mal formé', { code: 'GALS-123', deviceId: DEV_A }],
    ['deviceId mal formé', { code: CODE, deviceId: 'abc' }],
    ['champs manquants', {}],
    ['null', 'null'],
  ])('%s → 400', async (_name, body) => {
    expect((await post(body)).status).toBe(400)
  })

  it('CORS : origine autorisée renvoyée, autre origine sans en-tête', async () => {
    const ok = await post({ code: CODE, deviceId: DEV_A })
    expect(ok.headers.get('access-control-allow-origin')).toBe(ORIGIN)
    const other = await post({ code: CODE, deviceId: DEV_A }, 'https://evil.example')
    expect(other.headers.get('access-control-allow-origin')).toBeNull()

    const pre = await handle(new Request('https://x/activate', { method: 'OPTIONS', headers: { origin: ORIGIN } }), deps())
    expect(pre.status).toBe(204)
    expect(pre.headers.get('access-control-allow-headers')).toContain('apikey')
  })

  it('erreur base de données → 500', async () => {
    const d = { ...deps(), getLicense: async () => { throw new Error('down') } }
    const res = await handle(
      new Request('https://x/activate', { method: 'POST', body: JSON.stringify({ code: CODE, deviceId: DEV_A }) }),
      d,
    )
    expect(res.status).toBe(500)
  })
})
