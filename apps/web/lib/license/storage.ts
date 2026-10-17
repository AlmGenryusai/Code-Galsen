import { verifyLicense } from './token'
import type { License } from './license'

const DEVICE_KEY = 'galsen.device.v1'
const LICENSE_KEY = 'galsen.license.v1'
const DEVICE_RE = /^[0-9a-f]{32}$/

export const LICENSE_PUBLIC_KEY = process.env.NEXT_PUBLIC_LICENSE_PUBLIC_KEY ?? ''

/** Identifiant aléatoire créé une fois par téléphone (getRandomValues : randomUUID absent des vieux Chrome). */
export function getDeviceId(): string {
  try {
    const stored = window.localStorage.getItem(DEVICE_KEY)
    if (stored && DEVICE_RE.test(stored)) return stored
  } catch {
    // stockage indisponible : identifiant non persistant
  }
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
  try {
    window.localStorage.setItem(DEVICE_KEY, id)
  } catch {
    // idem
  }
  return id
}

export function saveLicenseToken(token: string) {
  try {
    window.localStorage.setItem(LICENSE_KEY, token)
  } catch {
    // stockage plein ou indisponible : licence valable pour cette session seulement
  }
}

function readLicenseToken(): string | null {
  try {
    return window.localStorage.getItem(LICENSE_KEY)
  } catch {
    return null
  }
}

/** Licence stockée, vérifiée hors ligne. */
export function loadLicense(): Promise<License> {
  return verifyLicense(readLicenseToken(), LICENSE_PUBLIC_KEY, getDeviceId(), Math.floor(Date.now() / 1000))
}
