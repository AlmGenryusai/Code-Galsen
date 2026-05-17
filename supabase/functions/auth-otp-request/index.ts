// supabase/functions/auth-otp-request/index.ts
// POST { phone } → envoie OTP 6 digits via Africa's Talking, stocke hash bcrypt.
// Rate-limit : 3 requêtes / heure / phone.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { preflight, jsonResponse } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const AT_API_KEY = Deno.env.get("AT_API_KEY")!;
const AT_USERNAME = Deno.env.get("AT_USERNAME") ?? "sandbox";
const AT_SENDER = Deno.env.get("AT_SMS_SENDER") ?? "GALSEN";

// Validation E.164 simple (+221 + 7-14 digits)
const PHONE_RE = /^\+[1-9][0-9]{7,14}$/;

serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  const origin = req.headers.get("origin");

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, origin);
  }

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, origin);
  }
  const phone = (body.phone ?? "").trim();

  if (!PHONE_RE.test(phone)) {
    return jsonResponse({ error: "invalid_phone" }, 400, origin);
  }

  // Rate-limit : compter requêtes dernière heure
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countErr } = await supabase
    .from("otp_codes")
    .select("*", { count: "exact", head: true })
    .eq("phone", phone)
    .gt("created_at", since);

  if (countErr) return jsonResponse({ error: "db_error" }, 500, origin);
  if ((count ?? 0) >= 3) {
    return jsonResponse({ error: "rate_limited", retry_after: 3600 }, 429, origin);
  }

  // Génère OTP 6 digits
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: insertErr } = await supabase.from("otp_codes").insert({
    phone,
    code_hash: hash,
    expires_at: expiresAt,
    ip_address: req.headers.get("x-forwarded-for") ?? null,
  });
  if (insertErr) return jsonResponse({ error: "db_error" }, 500, origin);

  // Envoi SMS Africa's Talking
  const smsBody = `Code Galsen : votre code est ${code}. Valable 5 min. Ne le partagez pas.`;
  const formData = new URLSearchParams({
    username: AT_USERNAME,
    to: phone,
    message: smsBody,
    from: AT_SENDER,
  });

  const atRes = await fetch(
    AT_USERNAME === "sandbox"
      ? "https://api.sandbox.africastalking.com/version1/messaging"
      : "https://api.africastalking.com/version1/messaging",
    {
      method: "POST",
      headers: {
        apiKey: AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    },
  );

  if (!atRes.ok) {
    console.error("AT SMS error", atRes.status, await atRes.text());
    // On retourne quand même 200 pour éviter d'exposer l'info à un attaquant
    // mais on logue côté Sentry.
  }

  return jsonResponse({ ok: true, expires_in_seconds: 300 }, 200, origin);
});
