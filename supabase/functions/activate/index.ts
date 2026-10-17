// Fonction Edge `activate` : lie un code à un appareil et renvoie une licence signée ed25519.
// Secrets : LICENSE_PRIVATE_KEY (PKCS8 DER en base64), APP_ORIGINS (origines séparées par des virgules).
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés par Supabase. Aucune dépendance externe.

import { handle, type LicenseRow } from './handler.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ORIGINS = (Deno.env.get('APP_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean)

let privateKey: Promise<CryptoKey> | null = null
function getPrivateKey(): Promise<CryptoKey> {
  privateKey ??= crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(Deno.env.get('LICENSE_PRIVATE_KEY') ?? ''), (c) => c.charCodeAt(0)),
    { name: 'Ed25519' },
    false,
    ['sign'],
  )
  return privateKey
}

async function rest(path: string, init: RequestInit = {}): Promise<LicenseRow[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  })
  if (!res.ok) throw new Error(`PostgREST ${res.status}`)
  return res.json()
}

const COLUMNS = 'select=code,device_id,activated_at,expires_at'

Deno.serve((req) =>
  handle(req, {
    async getLicense(code) {
      const rows = await rest(`licenses?code=eq.${encodeURIComponent(code)}&${COLUMNS}`)
      return rows[0] ?? null
    },
    async bindDevice(code, deviceId, activatedAt, expiresAt) {
      const rows = await rest(`licenses?code=eq.${encodeURIComponent(code)}&device_id=is.null&${COLUMNS}`, {
        method: 'PATCH',
        body: JSON.stringify({ device_id: deviceId, activated_at: activatedAt, expires_at: expiresAt }),
      })
      return rows.length === 1
    },
    async sign(message) {
      return new Uint8Array(await crypto.subtle.sign('Ed25519', await getPrivateKey(), message))
    },
    now: () => new Date(),
    allowedOrigins: ORIGINS,
  }),
)
