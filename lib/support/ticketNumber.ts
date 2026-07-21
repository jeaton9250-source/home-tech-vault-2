import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logSupportOperationError } from "@/lib/support/logging";

export function buildFallbackSupportTicketNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(
    Math.random() * 1_000_000
  )
    .toString()
    .padStart(6, "0");

  return `HTV-${year}-${suffix}`;
}

export async function generateSupportTicketNumber(
  admin: SupabaseClient
): Promise<string> {
  const { data, error } = await admin.rpc(
    "generate_support_ticket_number"
  );

  if (
    !error &&
    typeof data === "string" &&
    data.trim()
  ) {
    return data.trim();
  }

  logSupportOperationError(
    "generate_support_ticket_number",
    error,
    { usedFallback: true }
  );

  return buildFallbackSupportTicketNumber();
}
