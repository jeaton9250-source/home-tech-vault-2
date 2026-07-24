import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const DESTRUCTIVE_WINDOW_MS = 10 * 60 * 1000;
const DESTRUCTIVE_MAX_ACTIONS = 8;

export async function isDestructiveActionRateLimited(
  admin: SupabaseClient,
  actorId: string
): Promise<boolean> {
  const since = new Date(
    Date.now() - DESTRUCTIVE_WINDOW_MS
  ).toISOString();

  const { count, error } = await admin
    .from("platform_admin_audit_events")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("actor_id", actorId)
    .in("event_type", [
      "account_deactivated",
      "deletion_requested",
      "deletion_started",
    ])
    .gte("created_at", since);

  if (error) {
    console.error(
      "Unable to evaluate destructive action rate limit:",
      error
    );

    // Fail closed: do not allow destructive admin actions when
    // the audit/rate-limit backend is unavailable.
    return true;
  }

  return (count ?? 0) >= DESTRUCTIVE_MAX_ACTIONS;
}
