export type InvitationType =
  | "create_account"
  | "join_household";

export const INVITATION_TYPE_CREATE_ACCOUNT =
  "create_account" as const;

export const INVITATION_TYPE_JOIN_HOUSEHOLD =
  "join_household" as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

export function normalizeInvitationType(
  value: unknown
): InvitationType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "create_account" ||
    normalized === "new_account"
  ) {
    return INVITATION_TYPE_CREATE_ACCOUNT;
  }

  if (
    normalized === "join_household" ||
    normalized === "household_member"
  ) {
    return INVITATION_TYPE_JOIN_HOUSEHOLD;
  }

  return null;
}

export function isCreateAccountInvitation(
  value: unknown
): boolean {
  return (
    normalizeInvitationType(value) ===
    INVITATION_TYPE_CREATE_ACCOUNT
  );
}

export function isJoinHouseholdInvitation(
  value: unknown
): boolean {
  return (
    normalizeInvitationType(value) ===
    INVITATION_TYPE_JOIN_HOUSEHOLD
  );
}
