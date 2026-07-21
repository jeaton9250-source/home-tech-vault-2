export function isMissingPlanGrantsTableError(
  error: unknown
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as {
    code?: string;
    message?: string;
  };

  const message =
    record.message?.toLowerCase() ?? "";

  return (
    record.code === "PGRST205" ||
    record.code === "42P01" ||
    message.includes("platform_plan_grants") ||
    message.includes("does not exist")
  );
}
