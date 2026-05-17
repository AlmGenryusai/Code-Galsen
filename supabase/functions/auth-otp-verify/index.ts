// supabase/functions/auth-otp-verify/index.ts
// POST { phone, code } → vérifie OTP, crée/récupère user, émet JWT.
// Le trigger SQL `revoke_previous_sessions` invalide toutes les autres sessions.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { preflight, jsonResponse } from "../_shared/cors.ts";
import { signAccessToken, signRefreshToken } from "../_shared/jwt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PHONE_RE = /^\+[1-9][0-9]{7,14}$/;
const CODE_RE = /^[0-9]{6}$/;

serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  const origin = req.headers.get("origin");

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, origin);
  }

  let body: { phone?: string; code?: string; device_fp?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, origin);
  }
  const phone = (body.phone ?? "").trim();
  const code = (body.code ?? "").trim();

  if (!PHONE_RE.test(phone) || !CODE_RE.test(code)) {
    return jsonResponse({ error: "invalid_input" }, 400, origin);
  }

  // Récupère OTP actif le plus récent pour ce phone
  const { data: otp, error: otpErr } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpErr) return jsonResponse({ error: "db_error" }, 500, origin);
  if (!otp) return jsonResponse({ error: "otp_not_found_or_expired" }, 404, origin);

  if (otp.attempts >= 5) {
    return jsonResponse({ error: "too_many_attempts" }, 429, origin);
  }

  const ok = await bcrypt.compare(code, otp.code_hash);
  if (!ok) {
    await supabase
      .from("otp_codes")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    return jsonResponse({ error: "invalid_code" }, 401, origin);
  }

  // Marque OTP comme utilisé
  await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id);

  // Upsert user
  let userId: string;
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("phone", phone)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabase
      .from("users")
      .insert({ phone })
      .select("id")
      .single();
    if (createErr || !created) return jsonResponse({ error: "user_create_failed" }, 500, origin);
    userId = created.id;
  }

  // Crée session — trigger SQL révoque les autres
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: session, error: sessErr } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      device_fp: body.device_fp ?? null,
      user_agent: req.headers.get("user-agent") ?? null,
      ip_address: req.headers.get("x-forwarded-for") ?? null,
      expires_at: sessionExpiresAt,
    })
    .select("jti")
    .single();

  if (sessErr || !session) return jsonResponse({ error: "session_failed" }, 500, origin);

  const accessToken = await signAccessToken(userId, session.jti);
  const refreshToken = await signRefreshToken(userId, session.jti);

  return jsonResponse(
    {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 min
      user: { id: userId, phone },
    },
    200,
    origin,
  );
});
