import "server-only";

export type AdvisorLogCategory =
  | "route"
  | "auth"
  | "scope"
  | "context"
  | "rules"
  | "summary";

export type AdvisorDbError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export function logAdvisorStage(
  stage: string,
  category: AdvisorLogCategory,
  options?: {
    query?: string;
    error?: AdvisorDbError | null;
  }
) {
  const payload = {
    stage,
    category,
    ...(options?.query ? { query: options.query } : {}),
    ...(options?.error
      ? {
          code: options.error.code ?? null,
          message: options.error.message ?? null,
          details: options.error.details ?? null,
          hint: options.error.hint ?? null,
        }
      : {}),
  };

  if (options?.error) {
    console.error("[home-advisor]", payload);
    return;
  }

  console.info("[home-advisor]", payload);
}

export function toAdvisorDbError(
  error: unknown
): AdvisorDbError {
  if (!error || typeof error !== "object") {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    };
  }

  const record = error as AdvisorDbError;

  return {
    code: record.code ?? null,
    message: record.message ?? null,
    details: record.details ?? null,
    hint: record.hint ?? null,
  };
}

export function isMissingSchemaColumnError(
  error: AdvisorDbError | null | undefined
): boolean {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  return (
    code === "42703" ||
    code === "PGRST204" ||
    /column .* does not exist/i.test(
      message
    ) ||
    /could not find/i.test(message) ||
    /schema cache/i.test(message)
  );
}
