import { describe, it, expect } from 'vitest'
import { generateKeyPairSync, sign } from 'node:crypto'
import { verifyLicense } from './token'

// Paire de test, même format que la fonction Edge : signature ed25519 brute (64 octets)
const { privateKey, publicKey } = generateKeyPairSync('ed25519')
const PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'der' }).subarray(12).toString('base64url')
const OTHER_PUBLIC_KEY = generateKeyPairSync('ed25519')
  .publicKey.export({ type: 'spki', format: 'der' })
  .subarray(12)
  .toString('base64url')

const DEVICE = 'a'.repeat(32)
const NOW = 1_800_000_000
const EXP = NOW + 90 * 86_400

function token(payload: unknown, raw?: string): string {
  const p = Buffer.from(raw ?? JSON.stringify(payload)).toString('base64url')
  return `${p}.${sign(null, Buffer.from(p), privateKey).toString('base64url')}`
}

const valid = token({ code: 'GALS-7K3P-9QXM', deviceId: DEVICE, exp: EXP })

describe('verifyLicense', () => {
  it('licence valide → active, date de fin', async () => {
    expect(await verifyLicense(valid, PUBLIC_KEY, DEVICE, NOW)).toEqual({ active: true, expiresAt: EXP })
  })

  it('signature modifiée → inactive', async () => {
    const [p, s] = valid.split('.')
    const sig = Buffer.from(s, 'base64url')
    sig[0] ^= 1
    expect((await verifyLicense(`${p}.${sig.toString('base64url')}`, PUBLIC_KEY, DEVICE, NOW)).active).toBe(false)
  })

  it('charge utile modifiée (exp rallongée) → inactive', async () => {
    const forged = Buffer.from(JSON.stringify({ code: 'GALS-7K3P-9QXM', deviceId: DEVICE, exp: EXP * 2 })).toString('base64url')
    const sig = valid.split('.')[1]
    expect((await verifyLicense(`${forged}.${sig}`, PUBLIC_KEY, DEVICE, NOW)).active).toBe(false)
  })

  it('autre appareil → inactive', async () => {
    expect((await verifyLicense(valid, PUBLIC_KEY, 'b'.repeat(32), NOW)).active).toBe(false)
  })

  it('date dépassée → inactive', async () => {
    expect((await verifyLicense(valid, PUBLIC_KEY, DEVICE, EXP)).active).toBe(false)
    expect((await verifyLicense(valid, PUBLIC_KEY, DEVICE, EXP + 1)).active).toBe(false)
  })

  it('autre clé publique → inactive', async () => {
    expect((await verifyLicense(valid, OTHER_PUBLIC_KEY, DEVICE, NOW)).active).toBe(false)
  })

  it.each([
    ['rien en stockage', null],
    ['JSON brut', '{"code":"GALS-7K3P-9QXM","deviceId":"' + DEVICE + '","exp":9999999999}'],
    ['texte quelconque', '{oops'],
    ['3 segments', `${valid}.x`],
    ['caractères hors base64url', 'a+b/c.d=e'],
    ['JSON invalide mais signé', token(null, '{oops')],
    ['JSON signé sans les bons champs', token({ code: 'GALS-7K3P-9QXM', deviceId: DEVICE, exp: String(EXP) })],
  ])('%s → inactive', async (_name, stored) => {
    expect(await verifyLicense(stored, PUBLIC_KEY, DEVICE, NOW)).toEqual({ active: false, expiresAt: null })
  })

  it('clé publique absente du build → inactive', async () => {
    expect((await verifyLicense(valid, '', DEVICE, NOW)).active).toBe(false)
  })
})
