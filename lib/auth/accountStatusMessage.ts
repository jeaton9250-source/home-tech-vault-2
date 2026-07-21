export const DEACTIVATED_USER_MESSAGE =
  "This account is currently unavailable. Contact Home Tech Vault support for assistance.";

export type ProfileAccountStatus =
  | "active"
  | "deactivated";

export function normalizeProfileAccountStatus(
  value: string | null | undefined
): ProfileAccountStatus {
  return value === "deactivated"
    ? "deactivated"
    : "active";
}
