import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeHouseholdRole,
  normalizeRawHouseholdRole,
} from "@/lib/permissions/householdRole";
import type { RawHouseholdRole } from "@/lib/permissions/effectivePlan";
import type { HouseholdRole } from "@/lib/permissions/types";

export type HouseholdMembershipRow = {
  id: string;
  household_id: string;
  user_id: string;
  role: string;
  joined_at?: string | null;
};

export type ResolvedHouseholdMembership = {
  membership: HouseholdMembershipRow | null;
  householdId: string | null;
  rawHouseholdRole: RawHouseholdRole | null;
  normalizedRole: HouseholdRole | null;
};

/**
 * Load the authenticated user's membership row.
 * When `householdId` is provided, scopes to that household; otherwise returns
 * the most recently joined membership.
 */
export async function loadHouseholdMembershipForUser(
  client: SupabaseClient,
  userId: string,
  householdId?: string | null
): Promise<ResolvedHouseholdMembership> {
  let query = client
    .from("household_members")
    .select("id, household_id, user_id, role, joined_at")
    .eq("user_id", userId);

  if (householdId) {
    query = query.eq("household_id", householdId);
  } else {
    query = query
      .order("joined_at", {
        ascending: false,
      })
      .limit(1);
  }

  const {
    data: membership,
    error,
  } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  if (!membership) {
    return {
      membership: null,
      householdId: null,
      rawHouseholdRole: null,
      normalizedRole: null,
    };
  }

  const rawHouseholdRole =
    normalizeRawHouseholdRole(
      membership.role
    );

  return {
    membership:
      membership as HouseholdMembershipRow,
    householdId: membership.household_id,
    rawHouseholdRole,
    normalizedRole: normalizeHouseholdRole(
      membership.role
    ),
  };
}
