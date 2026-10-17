// Logique de la fonction `activate`, sans API Deno : testée sous vitest
// (apps/web/lib/license/activate-handler.test.ts). Câblage Deno : index.ts.

export interface LicenseRow {
  code: string
  device_id: string | null
  activated_at: string | null
  expires_at: string | null
}

export interface Deps {
  getLicense(code: string): Promise<LicenseRow | null>
  /** Lie l'appareil seulement si `device_id` est encore null. true = ligne modifiée. */
  bindDevice(code: string, deviceId: string, activatedAt: string, expiresAt: string): Promise<boolean>
  sign(message: Uint8Array): Promise<Uint8Array>
  now(): Date
  allowedOrigins: string[]
}

const DURATION_MS = 90 * 86_400_000
const CODE_RE = /^GALS-[A-Z0-9]{4}-[A-Z0-9]{4}$/
const DEVICE_RE = /^[0-9a-f]{32}$/

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Licence = base64url(JSON) + "." + base64url(signature ed25519 du 1er segment). */
async function issue(deps: Deps, code: string, deviceId: string, exp: number): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ code, deviceId, exp })))
  const signature = await deps.sign(new TextEncoder().encode(payload))
  return `${payload}.${b64url(signature)}`
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  if (!origin || !allowed.includes(origin)) return { Vary: 'Origin' }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const cors = corsHeaders(req.headers.get('origin'), deps.allowedOrigins)
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { code?: unknown; deviceId?: unknown } | null
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const c = typeof body?.code === 'string' ? body.code.toUpperCase() : ''
  const deviceId = typeof body?.deviceId === 'string' ? body.deviceId : ''
  if (!CODE_RE.test(c) || !DEVICE_RE.test(deviceId)) return json({ error: 'bad_request' }, 400)

  try {
    const now = deps.now()
    let row = await deps.getLicense(c)
    if (!row) return json({ error: 'unknown_code' }, 404)

    if (row.device_id === null) {
      // Transfert manuel (device_id remis à null) : on garde la date de fin d'origine
      const activatedAt = row.activated_at ?? now.toISOString()
      const expiresAt = row.expires_at ?? new Date(now.getTime() + DURATION_MS).toISOString()
      if (await deps.bindDevice(c, deviceId, activatedAt, expiresAt)) {
        row = { ...row, device_id: deviceId, activated_at: activatedAt, expires_at: expiresAt }
      } else {
        // Une autre requête a lié le code entre-temps : relire
        row = await deps.getLicense(c)
        if (!row) return json({ error: 'unknown_code' }, 404)
      }
    }

    if (row.device_id !== deviceId) return json({ error: 'already_used' }, 409)
    if (!row.expires_at) return json({ error: 'server' }, 500)

    const exp = Math.floor(Date.parse(row.expires_at) / 1000)
    if (exp <= Math.floor(now.getTime() / 1000)) return json({ error: 'expired' }, 410)

    return json({ license: await issue(deps, c, deviceId, exp) }, 200)
  } catch {
    return json({ error: 'server' }, 500)
  }
}
