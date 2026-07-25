import "server-only";

import { createHash } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

const PAIR_CONFIRM_WINDOW_MS = 15 * 60 * 1000;
const PAIR_CONFIRM_MAX_ATTEMPTS = 20;

function hashClientKey(rawKey: string): string {
  const salt =
    process.env.CONNECTOR_PAIRING_PEPPER?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "htv-pair-confirm-rate-limit";

  return createHash("sha256")
    .update(`${salt}:${rawKey}`)
    .digest("hex");
}

/**
 * Prefer platform-provided client IP. On Vercel, x-real-ip is set by the
 * edge; fall back to the first x-forwarded-for hop.
 */
export function getPairConfirmClientKey(
  request: Request
): string {
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const vercelForwarded = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (vercelForwarded) {
    return vercelForwarded;
  }

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (forwarded) {
    return forwarded;
  }

  return "unknown";
}

/**
 * Shared (DB) rate limit for pair confirm. Fail closed on backend errors.
 */
export async function checkPairConfirmRateLimit(
  admin: SupabaseClient,
  request: Request
): Promise<boolean> {
  const clientKeyHash = hashClientKey(
    getPairConfirmClientKey(request)
  );
  const since = new Date(
    Date.now() - PAIR_CONFIRM_WINDOW_MS
  ).toISOString();

  const { count, error: countError } = await admin
    .from("connector_pair_confirm_attempts")
    .select("id", { count: "exact", head: true })
    .eq("client_key_hash", clientKeyHash)
    .gte("created_at", since);

  if (countError) {
    console.error(
      "Unable to evaluate pair confirm rate limit:",
      countError.message
    );
    return false;
  }

  if ((count ?? 0) >= PAIR_CONFIRM_MAX_ATTEMPTS) {
    return false;
  }

  const { error: insertError } = await admin
    .from("connector_pair_confirm_attempts")
    .insert({ client_key_hash: clientKeyHash });

  if (insertError) {
    console.error(
      "Unable to record pair confirm attempt:",
      insertError.message
    );
    return false;
  }

  return true;
}
