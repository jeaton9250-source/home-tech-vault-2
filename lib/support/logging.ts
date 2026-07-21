import "server-only";

import { formatSupabaseError } from "@/lib/supabase";

export function logSupportOperationError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const formatted = formatSupabaseError(error);

  console.error("[support]", {
    operation,
    code: formatted.code ?? null,
    message: formatted.message ?? null,
    details: formatted.details ?? null,
    hint: formatted.hint ?? null,
    ...context,
    timestamp: new Date().toISOString(),
  });
}
