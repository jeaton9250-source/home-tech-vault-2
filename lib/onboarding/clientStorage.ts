import type { OnboardingStep } from "@/lib/onboarding/types";

const STORAGE_PREFIX =
  "home-tech-vault-onboarding";

export type LocalOnboardingState = {
  onboarding_completed_at: string | null;
  onboarding_step: OnboardingStep | null;
  onboarding_skipped_at: string | null;
};

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function readLocalOnboardingState(
  userId: string
): LocalOnboardingState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
      storageKey(userId)
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw
    ) as LocalOnboardingState;
  } catch {
    return null;
  }
}

export function writeLocalOnboardingState(
  userId: string,
  patch: Partial<LocalOnboardingState>
) {
  if (typeof window === "undefined") {
    return;
  }

  const current =
    readLocalOnboardingState(userId) ?? {
      onboarding_completed_at: null,
      onboarding_step: null,
      onboarding_skipped_at: null,
    };

  window.localStorage.setItem(
    storageKey(userId),
    JSON.stringify({
      ...current,
      ...patch,
    })
  );
}

export function clearLocalOnboardingState(
  userId: string
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    storageKey(userId)
  );
}

export function isOnboardingSchemaError(
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

  return (
    message.includes("onboarding_") ||
    message.includes(
      "schema cache"
    ) ||
    message.includes(
      "does not exist"
    ) ||
    ("code" in error &&
      error.code === "PGRST204")
  );
}

export function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}
