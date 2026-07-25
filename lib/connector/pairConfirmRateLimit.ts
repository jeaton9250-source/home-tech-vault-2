import "server-only";

import { createHash } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

const PAIR_CONFIRM_WINDOW_SECONDS = 15 * 60;
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
 * Shared (DB) rate limit for pair confirm. Uses an advisory-locked RPC when
 * available; fail closed on backend errors.
 */
export async function checkPairConfirmRateLimit(
  admin: SupabaseClient,
  request: Request
): Promise<boolean> {
  const clientKeyHash = hashClientKey(
    getPairConfirmClientKey(request)
  );

  const { data, error } = await admin.rpc(
    "claim_pair_confirm_attempt",
    {
      p_client_key_hash: clientKeyHash,
      p_window_seconds: PAIR_CONFIRM_WINDOW_SECONDS,
      p_max_attempts: PAIR_CONFIRM_MAX_ATTEMPTS,
    }
  );

  if (error) {
    console.error(
      "Unable to evaluate pair confirm rate limit:",
      error.message
    );
    return false;
  }

  return data === true;
}
