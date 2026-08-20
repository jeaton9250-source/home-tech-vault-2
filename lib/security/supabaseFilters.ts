/**
 * Helpers for safely constructing Supabase/PostgREST filter strings.
 *
 * Supabase Realtime currently accepts its `filter` option as a string,
 * so any dynamic value must be validated before interpolation.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSafeUuid(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value.trim())
  );
}

type RealtimeUuidColumn =
  | "household_id"
  | "id"
  | "imported_device_id"
  | "user_id";

export function buildUuidRealtimeFilter(
  column: RealtimeUuidColumn,
  value: string
): string {
  const normalized = value.trim();

  if (!isSafeUuid(normalized)) {
    throw new Error(
      `Invalid UUID supplied for ${column}.`
    );
  }

  return `${column}=eq.${normalized}`;
}

/**
 * PostgREST `.or()` requires a raw filter expression.
 * The only dynamic portion is a UUID that is validated
 * before being added to the expression.
 */
export function buildDiscoveryDeviceOrFilter(
  deviceId: string
): string {
  const normalized = deviceId.trim();

  if (!isSafeUuid(normalized)) {
    throw new Error(
      "Invalid device UUID supplied to discovery filter."
    );
  }

  return (
    `imported_device_id.eq.${normalized},` +
    "mac_address.not.is.null"
  );
}
