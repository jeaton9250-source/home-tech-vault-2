import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isGrantProvidingAccess,
  mapGrantRow,
} from "@/lib/plan-grants/grantAccess";
import { isMissingPlanGrantsTableError } from "@/lib/plan-grants/grantErrors";
import type { ActivePlanGrant } from "@/lib/plan-grants/types";

function handlePlanGrantQueryError(
  error: unknown
): null {
  if (isMissingPlanGrantsTableError(error)) {
    console.warn(
      "platform_plan_grants unavailable; treating as no grant."
    );
    return null;
  }

  throw error;
}

export async function loadActivePlanGrantForUser(
  client: SupabaseClient,
  userId: string
): Promise<ActivePlanGrant | null> {
  const { data, error } = await client
    .from("platform_plan_grants")
    .select(
      "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return handlePlanGrantQueryError(error);
  }

  if (!data) {
    return null;
  }

  const grant = mapGrantRow(data);

  if (!isGrantProvidingAccess(grant)) {
    return null;
  }

  return grant;
}

export async function loadLatestPlanGrantForUser(
  client: SupabaseClient,
  userId: string
): Promise<ActivePlanGrant | null> {
  const { data, error } = await client
    .from("platform_plan_grants")
    .select(
      "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return handlePlanGrantQueryError(error);
  }

  return data ? mapGrantRow(data) : null;
}
