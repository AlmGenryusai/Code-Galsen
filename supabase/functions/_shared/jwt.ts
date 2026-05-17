// supabase/functions/_shared/jwt.ts
// Helpers JWT RS256 (jose) — émission access/refresh + pass offline.

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "https://deno.land/x/jose@v5.6.3/index.ts";

const ISSUER = Deno.env.get("PASS_JWT_ISSUER") ?? "codegalsen.com";
const PRIVATE_PEM = Deno.env.get("PASS_JWT_PRIVATE_KEY")!;
const PUBLIC_PEM = Deno.env.get("PASS_JWT_PUBLIC_KEY")!;

let privKey: CryptoKey | null = null;
let pubKey: CryptoKey | null = null;

async function getPriv(): Promise<CryptoKey> {
  if (!privKey) {
    privKey = await importPKCS8(PRIVATE_PEM.replace(/\\n/g, "\n"), "RS256");
  }
  return privKey;
}

async function getPub(): Promise<CryptoKey> {
  if (!pubKey) {
    pubKey = await importSPKI(PUBLIC_PEM.replace(/\\n/g, "\n"), "RS256");
  }
  return pubKey;
}

// ---------------------------------------------------------------------------
// Access token (15 min)
// ---------------------------------------------------------------------------
export async function signAccessToken(
  userId: string,
  jti: string,
): Promise<string> {
  const key = await getPriv();
  return await new SignJWT({ sub: userId, jti, typ: "access" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

// ---------------------------------------------------------------------------
// Refresh token (30 jours)
// ---------------------------------------------------------------------------
export async function signRefreshToken(
  userId: string,
  jti: string,
): Promise<string> {
  const key = await getPriv();
  return await new SignJWT({ sub: userId, jti, typ: "refresh" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

// ---------------------------------------------------------------------------
// Pass offline (90 jours) — vérifié côté client via clé publique embarquée
// ---------------------------------------------------------------------------
export async function signPassToken(
  userId: string,
  passId: string,
  ttlDays = 90,
): Promise<string> {
  const key = await getPriv();
  return await new SignJWT({ sub: userId, pass_id: passId, typ: "pass" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ttlDays}d`)
    .sign(key);
}

// ---------------------------------------------------------------------------
// Verify (côté serveur — sessions actives)
// ---------------------------------------------------------------------------
export async function verifyToken(token: string) {
  const key = await getPub();
  return await jwtVerify(token, key, { issuer: ISSUER });
}
