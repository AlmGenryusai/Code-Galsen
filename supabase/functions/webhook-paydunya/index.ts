// supabase/functions/webhook-paydunya/index.ts
// POST callback PayDunya — vérifie HMAC, idempotent, active le pass.
// Idempotence via UNIQUE(provider, provider_ref) sur payment_intents.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonResponse } from "../_shared/cors.ts";
import { signPassToken } from "../_shared/jwt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PAYDUNYA_WEBHOOK_SECRET = Deno.env.get("PAYDUNYA_WEBHOOK_SECRET")!;
const PASS_TTL_DAYS = parseInt(Deno.env.get("PASS_JWT_TTL_DAYS") ?? "90", 10);

async function verifyHmac(payload: string, signature: string): Promise<boolean> {
  // PayDunya signe en SHA-512 du master_key + payload
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(PAYDUNYA_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["verify"],
  );
  const sig = hexToBytes(signature);
  return await crypto.subtle.verify("HMAC", key, sig, encoder.encode(payload));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paydunya-signature") ?? "";

  if (!await verifyHmac(rawBody, signature)) {
    console.warn("Webhook HMAC invalide", { signature: signature.slice(0, 12) });
    return jsonResponse({ error: "invalid_signature" }, 401);
  }

  let payload: {
    data: {
      status: string;
      invoice: { token: string; total_amount: number };
      custom_data: { intent_id: string; user_id: string };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const { data } = payload;
  const status = data.status; // "completed", "cancelled", "pending", etc.
  const providerRef = data.invoice.token;
  const intentId = data.custom_data.intent_id;
  const userId = data.custom_data.user_id;

  // Récupère intent — idempotence via update conditionnel
  const { data: intent } = await supabase
    .from("payment_intents")
    .select("id, status, user_id")
    .eq("provider", "paydunya")
    .eq("provider_ref", providerRef)
    .maybeSingle();

  if (!intent) {
    console.warn("Intent introuvable", { providerRef, intentId });
    return jsonResponse({ ok: true, note: "intent_not_found" }, 200);
  }

  // Si déjà traité avec succès, no-op idempotent
  if (intent.status === "success") {
    return jsonResponse({ ok: true, note: "already_processed" }, 200);
  }

  if (status !== "completed") {
    await supabase
      .from("payment_intents")
      .update({ status: "failed", raw_webhook: payload })
      .eq("id", intent.id);
    return jsonResponse({ ok: true, status: "failed" }, 200);
  }

  // Active le pass
  const now = new Date();
  const expires = new Date(now.getTime() + PASS_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { data: pass, error: passErr } = await supabase
    .from("passes")
    .insert({
      user_id: userId,
      payment_intent_id: intent.id,
      status: "active",
      amount_fcfa: data.invoice.total_amount,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .select("id")
    .single();

  if (passErr || !pass) {
    console.error("Pass insert failed", passErr);
    return jsonResponse({ error: "pass_insert_failed" }, 500);
  }

  // Signe JWT pass offline
  const passJwt = await signPassToken(userId, pass.id, PASS_TTL_DAYS);

  await supabase.from("passes").update({ pass_jwt: passJwt }).eq("id", pass.id);

  await supabase
    .from("payment_intents")
    .update({ status: "success", raw_webhook: payload })
    .eq("id", intent.id);

  return jsonResponse({ ok: true, pass_id: pass.id }, 200);
});
