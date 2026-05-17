// supabase/functions/_shared/cors.ts
// Headers CORS communs à toutes les Edge Functions.

const ALLOWED_ORIGINS = [
  "https://codegalsen.com",
  "https://www.codegalsen.com",
  "http://localhost:3000",
];

export function buildCorsHeaders(origin: string | null): HeadersInit {
  const ok = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

export function preflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(req.headers.get("origin")),
  });
}

export function jsonResponse(
  body: unknown,
  status = 200,
  origin: string | null = null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...buildCorsHeaders(origin),
    },
  });
}
