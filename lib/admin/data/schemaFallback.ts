import "server-only";

const MISSING_SCHEMA_CODES = new Set([
  "PGRST204",
  "42703",
  "42P01",
]);

export function isMissingAdminControlsSchema(
  error: unknown
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error &&
    typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  const code =
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : null;

  if (code && MISSING_SCHEMA_CODES.has(code)) {
    return true;
  }

  return (
    message.includes("account_status") ||
    message.includes("deactivated_at") ||
    message.includes("deactivation_reason") ||
    message.includes(
      "admin_account_deletion_jobs"
    ) ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

export function normalizeAdminAccountStatus(
  value: string | null | undefined
): "active" | "deactivated" {
  return value === "deactivated"
    ? "deactivated"
    : "active";
}
