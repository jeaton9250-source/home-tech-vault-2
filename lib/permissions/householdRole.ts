import type { RawHouseholdRole } from "@/lib/permissions/effectivePlan";

import type { HouseholdRole } from "@/lib/permissions/types";

function normalizeRoleToken(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function normalizeRawHouseholdRole(
  value: string | null | undefined
): RawHouseholdRole | null {
  if (!value) {
    return null;
  }

  const token = normalizeRoleToken(value);

  if (
    token === "owner" ||
    token === "household_owner"
  ) {
    return "owner";
  }

  if (
    token === "admin" ||
    token === "family_admin" ||
    token === "household_admin"
  ) {
    return "admin";
  }

  if (token === "member") {
    return "member";
  }

  if (token === "viewer") {
    return "viewer";
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
  const rawRole =
    normalizeRawHouseholdRole(value);

  if (!rawRole) {
    return null;
  }

  if (rawRole === "admin" || rawRole === "owner") {
    return "admin";
  }

  if (rawRole === "member") {
    return "member";
  }

  return "viewer";
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
