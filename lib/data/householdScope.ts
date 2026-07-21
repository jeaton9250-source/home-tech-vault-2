import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

/**
 * Verified column support per table (probed against live PostgREST schema).
 * `both` = filter household members by household_id; personal by user_id.
 * `user_id_only` = use applyOwnerUserScope / resolveOwnerUserId for households.
 * `neither` = scope via FK (household_id on invitations) or id lookup only.
 */
export const TABLE_SCOPE = {
  devices: "both",
  device_documents: "both",
  device_images: "both",
  device_events: "user_id_only",
  documents: "both",
  maintenance_tasks: "both",
  network_info: "both",
  network_scans: "user_id_only",
  network_discoveries: "user_id_only",
  subscriptions: "both",
  user_subscriptions: "user_id_only",
  household_members: "both",
  households: "neither",
  household_invitations: "household_id_only",
  profiles: "neither",
  contact_messages: "user_id_only",
} as const;

export type TableScopeKind =
  (typeof TABLE_SCOPE)[keyof typeof TABLE_SCOPE];

export type HouseholdScope = {
  mode: "household" | "personal";
  householdId: string | null;
  userId: string;
  column: "household_id" | "user_id";
  value: string;
};

/**
 * Resolve whether queries should filter by shared household or personal user.
 * Pass `householdId` from `usePermissions()` — do not re-derive membership in pages.
 */
export function resolveHouseholdScope(
  householdId: string | null | undefined,
  userId: string
): HouseholdScope {
  if (householdId) {
    return {
      mode: "household",
      householdId,
      userId,
      column: "household_id",
      value: householdId,
    };
  }

  return {
    mode: "personal",
    householdId: null,
    userId,
    column: "user_id",
    value: userId,
  };
}

type ScopedEqQuery = {
  eq: (
    column: string,
    value: string
  ) => ScopedEqQuery;
};

/**
 * Apply household or personal scope to a Supabase query builder.
 * Returns the query builder for chaining; typed as `any` to avoid deep generics.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyHouseholdScope(
  query: unknown,
  householdId: string | null | undefined,
  userId: string
): any {
  const scope = resolveHouseholdScope(
    householdId,
    userId
  );

  return (query as ScopedEqQuery).eq(
    scope.column,
    scope.value
  );
}

/**
 * Resolve `user_id` for tables that do not have `household_id`
 * (e.g. `network_scans`, `network_discoveries`).
 * Household members read the billing owner's rows.
 */
export function resolveOwnerUserId(
  householdId: string | null | undefined,
  userId: string,
  householdOwnerId: string | null | undefined
): string {
  if (householdId) {
    return householdOwnerId ?? userId;
  }

  return userId;
}

/**
 * Scope queries to `user_id` for tables without a `household_id` column.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOwnerUserScope(
  query: unknown,
  householdId: string | null | undefined,
  userId: string,
  householdOwnerId: string | null | undefined
): any {
  return (query as ScopedEqQuery).eq(
    "user_id",
    resolveOwnerUserId(
      householdId,
      userId,
      householdOwnerId
    )
  );
}

/**
 * Attach `user_id` for inserts into tables without a `household_id` column.
 */
export function withOwnerUserInsertFields<
  T extends Record<string, unknown>,
>(
  payload: T,
  householdId: string | null | undefined,
  userId: string,
  householdOwnerId: string | null | undefined
): T & { user_id: string } {
  return {
    ...payload,
    user_id: resolveOwnerUserId(
      householdId,
      userId,
      householdOwnerId
    ),
  };
}

/**
 * Attach `user_id` and optional `household_id` for inserts into scoped tables.
 */
export function withHouseholdInsertFields<
  T extends Record<string, unknown>,
>(
  payload: T,
  householdId: string | null | undefined,
  userId: string
): T & {
  user_id: string;
  household_id: string | null;
} {
  return {
    ...payload,
    user_id: userId,
    household_id: householdId ?? null,
  };
}

/**
 * Apply household or personal scope to a mutation query that already targets a row id.
 */
export function applyHouseholdMutationScope(
  query: unknown,
  householdId: string | null | undefined,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return applyHouseholdScope(
    query,
    householdId,
    userId
  );
}

/**
 * Load household membership when permissions context is unavailable
 * (e.g. server data loaders). Prefer `householdId` from `usePermissions()`.
 */
export async function fetchHouseholdIdForUser(
  userId: string,
  client: SupabaseClient = supabase
): Promise<string | null> {
  const {
    data: membership,
    error,
  } = await client
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return membership?.household_id ?? null;
}

export type ResolvedHouseholdAccess = {
  householdId: string | null;
  householdOwnerId: string | null;
};

/**
 * Resolve household membership and billing owner for server loaders
 * when `usePermissions()` is unavailable.
 */
export async function resolveHouseholdAccess(
  userId: string,
  client: SupabaseClient = supabase
): Promise<ResolvedHouseholdAccess> {
  const householdId =
    await fetchHouseholdIdForUser(
      userId,
      client
    );

  if (!householdId) {
    return {
      householdId: null,
      householdOwnerId: null,
    };
  }

  const {
    data: household,
    error,
  } = await client
    .from("households")
    .select("owner_id")
    .eq("id", householdId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    householdId,
    householdOwnerId:
      household?.owner_id ?? null,
  };
}

/**
 * Load network_info with household scope and legacy owner-user fallback.
 */
export async function loadNetworkInfoRows(
  client: SupabaseClient,
  householdId: string | null | undefined,
  userId: string,
  householdOwnerId: string | null | undefined
) {
  const scopedResult = await applyHouseholdScope(
    client.from("network_info").select("*"),
    householdId,
    userId
  ).limit(1);

  if (scopedResult.error) {
    return scopedResult;
  }

  const rows = scopedResult.data ?? [];

  if (rows.length > 0 || !householdId) {
    return scopedResult;
  }

  const ownerUserId =
    householdOwnerId ?? userId;

  return applyHouseholdScope(
    client.from("network_info").select("*"),
    null,
    ownerUserId
  ).limit(1);
}
