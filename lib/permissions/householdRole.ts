import type { RawHouseholdRole } from "@/lib/permissions/effectivePlan";

import type { HouseholdRole } from "@/lib/permissions/types";

export function normalizeRawHouseholdRole(
  value: string | null | undefined
): RawHouseholdRole | null {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "member" ||
    value === "viewer"
  ) {
    return value;
  }

  return null;
}

/**
 * Map stored household roles to mutation-capability roles.
 * Returns null when the user has no household membership.
 */
export function normalizeHouseholdRole(
  value: string | null | undefined
): HouseholdRole | null {
  if (!value) {
    return null;
  }

  if (value === "admin" || value === "owner") {
    return "admin";
  }

  if (value === "member") {
    return "member";
  }

  if (value === "viewer") {
    return "viewer";
  }

  return null;
}

export function hasHouseholdViewerRestrictions(options: {
  householdId: string | null;
  role: HouseholdRole | null;
}): boolean {
  return (
    Boolean(options.householdId) &&
    options.role === "viewer"
  );
}
