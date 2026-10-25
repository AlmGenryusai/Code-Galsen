import { LICENSE_PUBLIC_KEY, getDeviceId, saveLicenseToken } from './storage'
import { verifyLicense } from './token'
import type { License } from './license'

export type ActivationError = 'unknown_code' | 'already_used' | 'expired' | 'network' | 'server'
export type ActivationResult = { ok: true; license: License } | { ok: false; error: ActivationError }

const TIMEOUT_MS = 15_000
const STATUS_ERRORS: Record<number, ActivationError> = { 404: 'unknown_code', 409: 'already_used', 410: 'expired' }

/** Appelle la fonction Edge `activate`, vérifie la licence reçue puis la stocke. */
export async function activate(code: string): Promise<ActivationResult> {
  if (navigator.onLine === false) return { ok: false, error: 'network' }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return { ok: false, error: 'server' }

  const deviceId = getDeviceId()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${url}/functions/v1/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
      body: JSON.stringify({ code, deviceId }),
      signal: controller.signal,
    })
  } catch {
    return { ok: false, error: 'network' } // hors ligne, coupure ou délai dépassé
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) return { ok: false, error: STATUS_ERRORS[res.status] ?? 'server' }

  const body: unknown = await res.json().catch(() => null)
  const token = typeof body === 'object' && body !== null ? (body as { license?: unknown }).license : null
  if (typeof token !== 'string') return { ok: false, error: 'server' }

  const license = await verifyLicense(token, LICENSE_PUBLIC_KEY, deviceId, Math.floor(Date.now() / 1000))
  if (!license.active) return { ok: false, error: 'server' }
  saveLicenseToken(token)
  return { ok: true, license }
}
