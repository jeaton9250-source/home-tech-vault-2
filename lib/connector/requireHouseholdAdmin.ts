import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";

import type { User } from "@supabase/supabase-js";

export class HouseholdAdminAccessError extends Error {
  readonly code:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "BAD_REQUEST";

  constructor(
    code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "BAD_REQUEST",
    message?: string
  ) {
    super(message ?? code);
    this.code = code;
  }
}

export type HouseholdAdminContext = {
  user: User;
  userId: string;
  householdId: string;
  rawHouseholdRole: string;
};

export type HouseholdMemberContext = {
  user: User;
  userId: string;
  householdId: string;
  rawHouseholdRole: string;
  normalizedRole: string | null;
};

function parseHouseholdId(
  value: unknown
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new HouseholdAdminAccessError(
      "BAD_REQUEST",
      "A valid householdId is required."
    );
  }

  return value.trim();
}

async function requireAuthenticatedUser(): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HouseholdAdminAccessError(
      "UNAUTHORIZED"
    );
  }

  return user;
}

/**
 * Require an authenticated household owner or admin for the explicit household.
 */
export async function requireHouseholdAdmin(
  householdIdInput: unknown
): Promise<HouseholdAdminContext> {
  const householdId =
    parseHouseholdId(householdIdInput);

  const user =
    await requireAuthenticatedUser();

  const admin = createAdminClient();

  const membershipResult =
    await loadHouseholdMembershipForUser(
      admin,
      user.id,
      householdId
    );

  if (
    !membershipResult.membership ||
    membershipResult.householdId !==
      householdId
  ) {
    throw new HouseholdAdminAccessError(
      "FORBIDDEN",
      "You are not a member of this household."
    );
  }

  const rawRole =
    membershipResult.rawHouseholdRole;

  if (
    rawRole !== "owner" &&
    rawRole !== "admin"
  ) {
    throw new HouseholdAdminAccessError(
      "FORBIDDEN",
      "Household Admin permission required."
    );
  }

  return {
    user,
    userId: user.id,
    householdId,
    rawHouseholdRole: rawRole,
  };
}

/**
 * Require an authenticated household member for the explicit household.
 */
export async function requireHouseholdMember(
  householdIdInput: unknown
): Promise<HouseholdMemberContext> {
  const householdId =
    parseHouseholdId(householdIdInput);

  const user =
    await requireAuthenticatedUser();

  const admin = createAdminClient();

  const membershipResult =
    await loadHouseholdMembershipForUser(
      admin,
      user.id,
      householdId
    );

  if (
    !membershipResult.membership ||
    membershipResult.householdId !==
      householdId
  ) {
    throw new HouseholdAdminAccessError(
      "FORBIDDEN",
      "You are not a member of this household."
    );
  }

  return {
    user,
    userId: user.id,
    householdId,
    rawHouseholdRole:
      membershipResult.rawHouseholdRole ??
      "viewer",
    normalizedRole:
      membershipResult.normalizedRole,
  };
}

/**
 * Require an authenticated household member with edit permission (admin or member).
 */
export async function requireHouseholdMutator(
  householdIdInput: unknown
): Promise<HouseholdMemberContext> {
  const context =
    await requireHouseholdMember(
      householdIdInput
    );

  if (
    context.normalizedRole !== "member" &&
    context.normalizedRole !== "admin"
  ) {
    throw new HouseholdAdminAccessError(
      "FORBIDDEN",
      "Household edit permission required."
    );
  }

  return context;
}

export function householdAccessResponse(
  error: unknown
) {
  if (
    error instanceof HouseholdAdminAccessError
  ) {
    if (error.code === "UNAUTHORIZED") {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }

    if (error.code === "BAD_REQUEST") {
      return {
        status: 400,
        message:
          error.message ??
          "Invalid request.",
      };
    }

    return {
      status: 403,
      message:
        error.message ?? "Forbidden",
    };
  }

  return null;
}
