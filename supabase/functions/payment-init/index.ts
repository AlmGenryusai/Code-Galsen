// supabase/functions/payment-init/index.ts
// POST {} (avec auth JWT) → crée payment_intent + retourne URL PayDunya.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { preflight, jsonResponse } from "../_shared/cors.ts";
import { verifyToken } from "../_shared/jwt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PAYDUNYA_MASTER_KEY = Deno.env.get("PAYDUNYA_MASTER_KEY")!;
const PAYDUNYA_PRIVATE_KEY = Deno.env.get("PAYDUNYA_PRIVATE_KEY")!;
const PAYDUNYA_TOKEN = Deno.env.get("PAYDUNYA_TOKEN")!;
const PAYDUNYA_MODE = Deno.env.get("PAYDUNYA_MODE") ?? "test";
const APP_URL = Deno.env.get("APP_URL") ?? "https://codegalsen.com";
const AMOUNT = 4900;

serve(async (req) => {
  const cors = preflight(req);
  if (cors) return cors;
  const origin = req.headers.get("origin");

  if (req.method !== "POST") {
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

  // Crée payment_intent pending — provider_ref généré côté PayDunya, on l'update au retour
  const intentRef = crypto.randomUUID();
  const { data: intent, error: insertErr } = await supabase
    .from("payment_intents")
    .insert({
      user_id: userId,
      provider: "paydunya",
      provider_ref: intentRef, // temporaire, sera mis à jour avec token PayDunya
      amount_fcfa: AMOUNT,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertErr || !intent) return jsonResponse({ error: "db_error" }, 500, origin);

  // Appel PayDunya — créer invoice
  const url = PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1/checkout-invoice/create"
    : "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";

  const body = {
    invoice: {
      total_amount: AMOUNT,
      description: "Code Galsen — Pass Réussite 90 jours",
    },
    store: { name: "Code Galsen", website_url: APP_URL },
    custom_data: { intent_id: intent.id, user_id: userId },
    actions: {
      callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-paydunya`,
      return_url: `${APP_URL}/paiement/retour?intent=${intent.id}`,
      cancel_url: `${APP_URL}/paiement/annule`,
    },
  };

  const pdRes = await fetch(url, {
    method: "POST",
    headers: {
      "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY,
      "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY,
      "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const pdJson = await pdRes.json();
  if (pdJson.response_code !== "00") {
    console.error("PayDunya init error", pdJson);
    return jsonResponse({ error: "payment_provider_error", detail: pdJson.response_text }, 502, origin);
  }

  // Met à jour provider_ref avec le token PayDunya pour idempotence webhook
  await supabase
    .from("payment_intents")
    .update({ provider_ref: pdJson.token })
    .eq("id", intent.id);

  return jsonResponse(
    {
      intent_id: intent.id,
      checkout_url: pdJson.response_text, // URL redirection user
      provider_token: pdJson.token,
    },
    200,
    origin,
  );
});
