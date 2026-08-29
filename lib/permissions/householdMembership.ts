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
  /*
   * Explicit household selection is authoritative.
   *
   * Realtor Client Vault preparation passes householdId
   * deliberately, so that workflow still resolves the
   * selected property.
   */
  if (householdId) {
    const {
      data: membership,
      error,
    } = await client
      .from("household_members")
      .select(
        "id, household_id, user_id, role, joined_at"
      )
      .eq("user_id", userId)
      .eq("household_id", householdId)
      .maybeSingle();

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
      householdId:
        membership.household_id,
      rawHouseholdRole,
      normalizedRole:
        normalizeHouseholdRole(
          membership.role
        ),
    };
  }

  /*
   * DEFAULT / "MY HOME" RESOLUTION
   *
   * A Realtor may temporarily own several property
   * households while preparing closing gifts.
   *
   * Those Client Vault households must NEVER become the
   * Realtor's normal Home Tech Vault household merely
   * because they were joined more recently.
   */

  const [
    membershipResult,
    realtorGiftResult,
  ] = await Promise.all([
    client
      .from("household_members")
      .select(
        "id, household_id, user_id, role, joined_at"
      )
      .eq("user_id", userId)
      .order("joined_at", {
        ascending: false,
      }),

    client
      .from("realtor_vault_gifts")
      .select("household_id")
      .eq("realtor_user_id", userId)
      .not("household_id", "is", null),
  ]);

  if (membershipResult.error) {
    throw membershipResult.error;
  }

  if (realtorGiftResult.error) {
    throw realtorGiftResult.error;
  }

  const realtorHouseholdIds =
    new Set(
      (realtorGiftResult.data ?? [])
        .map((gift) =>
          gift.household_id
        )
        .filter(
          (
            value
          ): value is string =>
            typeof value === "string" &&
            value.length > 0
        )
    );

  const memberships =
    (membershipResult.data ?? []) as
      HouseholdMembershipRow[];

  /*
   * Prefer the newest membership that is NOT one of this
   * Realtor's Client Vault households.
   */
  const membership =
    memberships.find(
      (candidate) =>
        !realtorHouseholdIds.has(
          candidate.household_id
        )
    ) ?? null;

  if (!membership) {
    /*
     * Realtor-only accounts may legitimately have no
     * personal Home Vault yet. Do not silently substitute
     * one of their Client Vaults.
     */
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
    membership,
    householdId:
      membership.household_id,
    rawHouseholdRole,
    normalizedRole:
      normalizeHouseholdRole(
        membership.role
      ),
  };
}
