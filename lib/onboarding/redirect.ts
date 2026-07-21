import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isOnboardingStep,
} from "@/lib/onboarding/steps";

import type {
  OnboardingProfileState,
} from "@/lib/onboarding/types";

const ONBOARDING_BYPASS_PREFIXES = [
  "/family/accept/",
] as const;

export function shouldBypassOnboardingRedirect(
  path: string
): boolean {
  return ONBOARDING_BYPASS_PREFIXES.some(
    (prefix) => path.startsWith(prefix)
  );
}

export function isOnboardingFinished(
  profile: Pick<
    OnboardingProfileState,
    | "onboarding_completed_at"
    | "onboarding_skipped_at"
  > | null
): boolean {
  return Boolean(
    profile?.onboarding_completed_at
  );
}

export function shouldShowOnboarding(
  profile: Pick<
    OnboardingProfileState,
    | "onboarding_completed_at"
    | "onboarding_skipped_at"
  > | null
): boolean {
  if (!profile) {
    return true;
  }

  if (profile.onboarding_completed_at) {
    return false;
  }

  if (profile.onboarding_skipped_at) {
    return false;
  }

  return true;
}

export async function loadOnboardingProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<OnboardingProfileState | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "onboarding_completed_at, onboarding_step, onboarding_skipped_at, full_name, household_name"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load onboarding profile:",
      error
    );
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    onboarding_completed_at:
      data.onboarding_completed_at ?? null,
    onboarding_step: isOnboardingStep(
      data.onboarding_step
    )
      ? data.onboarding_step
      : null,
    onboarding_skipped_at:
      data.onboarding_skipped_at ?? null,
    full_name: data.full_name ?? null,
    household_name:
      data.household_name ?? null,
  };
}

export async function resolvePostAuthRedirect(
  supabase: SupabaseClient,
  userId: string,
  requestedPath: string
): Promise<string> {
  const path =
    requestedPath?.trim() || "/dashboard";

  if (shouldBypassOnboardingRedirect(path)) {
    return path;
  }

  const profile =
    await loadOnboardingProfile(
      supabase,
      userId
    );

  if (path === "/onboarding") {
    return "/onboarding";
  }

  if (
    isOnboardingFinished(profile)
  ) {
    return path;
  }

  if (
    profile?.onboarding_skipped_at &&
    path !== "/onboarding"
  ) {
    return path;
  }

  if (
    path === "/dashboard" ||
    path === "/login"
  ) {
    return "/onboarding";
  }

  return path;
}
