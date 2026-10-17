// Vérification hors ligne de la licence signée (format : supabase/functions/activate/handler.ts).
// noble plutôt que WebCrypto Ed25519 : natif seulement depuis Chrome 137, trop récent pour la cible.

import { verifyAsync } from '@noble/ed25519'
import type { License } from './license'

export const INACTIVE: License = { active: false, expiresAt: null }

interface Payload {
  code: string
  deviceId: string
  exp: number // secondes epoch
}

export function b64urlDecode(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('base64url invalide')
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0))
}

function isPayload(p: unknown): p is Payload {
  if (typeof p !== 'object' || p === null) return false
  const o = p as Record<string, unknown>
  return typeof o.code === 'string' && typeof o.deviceId === 'string' && typeof o.exp === 'number'
}

/** Licence active seulement si signature valide, même appareil et date non dépassée. */
export async function verifyLicense(
  token: string | null,
  publicKey: string, // 32 octets en base64url
  deviceId: string,
  nowSec: number,
): Promise<License> {
  try {
    if (!token || !publicKey) return INACTIVE
    const parts = token.split('.')
    if (parts.length !== 2) return INACTIVE
    const [payload, signature] = parts
    const pub = b64urlDecode(publicKey)
    const sig = b64urlDecode(signature)
    if (pub.length !== 32 || sig.length !== 64) return INACTIVE
    if (!(await verifyAsync(sig, new TextEncoder().encode(payload), pub))) return INACTIVE

    const data: unknown = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)))
    if (!isPayload(data) || data.deviceId !== deviceId || data.exp <= nowSec) return INACTIVE
    return { active: true, expiresAt: data.exp }
  } catch {
    return INACTIVE
  }
}
