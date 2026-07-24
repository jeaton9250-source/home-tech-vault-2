/**
 * Protect privileged profile columns that must not be client-writable.
 * DB trigger is the source of truth; this is defense-in-depth for app updates.
 */

const PRIVILEGED_PROFILE_KEYS = [
  "is_admin",
  "account_status",
  "deactivated_at",
  "deactivated_by",
  "deactivation_reason",
  "deactivation_notes",
  "reactivated_at",
  "reactivated_by",
] as const;

export function stripPrivilegedProfileFields<
  T extends Record<string, unknown>,
>(payload: T): Omit<T, (typeof PRIVILEGED_PROFILE_KEYS)[number]> {
  const next = { ...payload };

  for (const key of PRIVILEGED_PROFILE_KEYS) {
    delete next[key];
  }

  return next;
}
