// supabase/functions/payment-reconcile/index.ts
// GET ?intent_id=... (avec auth JWT)
// Bouton "Restaurer mon achat" — re-query PayDunya si webhook perdu.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { preflight, jsonResponse } from "../_shared/cors.ts";
import { verifyToken, signPassToken } from "../_shared/jwt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PAYDUNYA_MASTER_KEY = Deno.env.get("PAYDUNYA_MASTER_KEY")!;
const PAYDUNYA_PRIVATE_KEY = Deno.env.get("PAYDUNYA_PRIVATE_KEY")!;
const PAYDUNYA_TOKEN = Deno.env.get("PAYDUNYA_TOKEN")!;
const PAYDUNYA_MODE = Deno.env.get("PAYDUNYA_MODE") ?? "test";
const PASS_TTL_DAYS = parseInt(Deno.env.get("PASS_JWT_TTL_DAYS") ?? "90", 10);

serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  const origin = req.headers.get("origin");

  if (req.method !== "GET") {
    return jsonResponse({ error: "method_not_allowed" }, 405, origin);
  }

  // Auth
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  let userId: string;
  try {
    const { payload } = await verifyToken(token);
    userId = payload.sub as string;
  } catch {
    return jsonResponse({ error: "unauthorized" }, 401, origin);
  }

  const url = new URL(req.url);
  const intentId = url.searchParams.get("intent_id");
  if (!intentId) return jsonResponse({ error: "missing_intent_id" }, 400, origin);

  const { data: intent } = await supabase
    .from("payment_intents")
    .select("id, status, provider_ref, user_id, amount_fcfa")
    .eq("id", intentId)
    .eq("user_id", userId) // sécurité : seul le propriétaire peut reconcile
    .maybeSingle();

  if (!intent) return jsonResponse({ error: "intent_not_found" }, 404, origin);

  // Si déjà success, retourner le pass actif
  if (intent.status === "success") {
    const { data: pass } = await supabase
      .from("passes")
      .select("id, pass_jwt, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pass) {
      return jsonResponse({ status: "active", pass_jwt: pass.pass_jwt, expires_at: pass.expires_at }, 200, origin);
    }
  }

  // Re-query PayDunya
  const confirmUrl = PAYDUNYA_MODE === "live"
    ? `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${intent.provider_ref}`
    : `https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${intent.provider_ref}`;

  const pdRes = await fetch(confirmUrl, {
    method: "GET",
    headers: {
      "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY,
      "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY,
      "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN,
    },
  });

  const pdJson = await pdRes.json();
  if (pdJson.status !== "completed") {
    return jsonResponse({ status: "pending" }, 200, origin);
  }

  // Active le pass (même flow que webhook)
  const now = new Date();
  const expires = new Date(now.getTime() + PASS_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { data: pass } = await supabase
    .from("passes")
    .insert({
      user_id: userId,
      payment_intent_id: intent.id,
      status: "active",
      amount_fcfa: intent.amount_fcfa,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .select("id")
    .single();

  if (!pass) return jsonResponse({ error: "pass_insert_failed" }, 500, origin);

  const passJwt = await signPassToken(userId, pass.id, PASS_TTL_DAYS);
  await supabase.from("passes").update({ pass_jwt: passJwt }).eq("id", pass.id);
  await supabase.from("payment_intents").update({ status: "success" }).eq("id", intent.id);

  return jsonResponse({ status: "active", pass_jwt: passJwt, expires_at: expires.toISOString() }, 200, origin);
});
