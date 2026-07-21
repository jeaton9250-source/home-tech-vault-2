import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isOnboardingSchemaError,
  readLocalOnboardingState,
} from "@/lib/onboarding/clientStorage";

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

export function hasSeenOnboarding(
  profile: Pick<
    OnboardingProfileState,
    | "onboarding_completed_at"
    | "onboarding_skipped_at"
    | "onboarding_step"
  > | null
): boolean {
  if (!profile) {
    return false;
  }

  if (profile.onboarding_completed_at) {
    return true;
  }

  if (profile.onboarding_skipped_at) {
    return true;
  }

  return profile.onboarding_step !== null;
}

export function isOnboardingFinished(
  profile: Pick<
    OnboardingProfileState,
    | "onboarding_completed_at"
    | "onboarding_skipped_at"
    | "onboarding_step"
  > | null
): boolean {
  return hasSeenOnboarding(profile);
}

export function shouldShowOnboarding(
  profile: Pick<
    OnboardingProfileState,
    | "onboarding_completed_at"
    | "onboarding_skipped_at"
    | "onboarding_step"
  > | null
): boolean {
  if (!profile) {
    return true;
  }

  return !hasSeenOnboarding(profile);
}

function mergeWithLocalOnboardingState(
  userId: string,
  profile: OnboardingProfileState | null
): OnboardingProfileState | null {
  const localState =
    readLocalOnboardingState(userId);

  if (!localState) {
    return profile;
  }

  const localStep = isOnboardingStep(
    localState.onboarding_step
  )
    ? localState.onboarding_step
    : null;

  if (!profile) {
    return {
      onboarding_completed_at:
        localState.onboarding_completed_at,
      onboarding_step: localStep,
      onboarding_skipped_at:
        localState.onboarding_skipped_at,
      full_name: null,
      household_name: null,
    };
  }

  return {
    ...profile,
    onboarding_completed_at:
      profile.onboarding_completed_at ??
      localState.onboarding_completed_at,
    onboarding_skipped_at:
      profile.onboarding_skipped_at ??
      localState.onboarding_skipped_at,
    onboarding_step:
      profile.onboarding_step ?? localStep,
  };
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
    if (isOnboardingSchemaError(error)) {
      const localState =
        readLocalOnboardingState(userId);

      if (!localState) {
        return null;
      }

      return {
        onboarding_completed_at:
          localState.onboarding_completed_at,
        onboarding_step: isOnboardingStep(
          localState.onboarding_step
        )
          ? localState.onboarding_step
          : null,
        onboarding_skipped_at:
          localState.onboarding_skipped_at,
        full_name: null,
        household_name: null,
      };
    }

    console.error(
      "Unable to load onboarding profile:",
      error
    );

    return mergeWithLocalOnboardingState(
      userId,
      null
    );
  }

  const profile = data
    ? {
        onboarding_completed_at:
          data.onboarding_completed_at ??
          null,
        onboarding_step: isOnboardingStep(
          data.onboarding_step
        )
          ? data.onboarding_step
          : null,
        onboarding_skipped_at:
          data.onboarding_skipped_at ??
          null,
        full_name: data.full_name ?? null,
        household_name:
          data.household_name ?? null,
      }
    : null;

  return mergeWithLocalOnboardingState(
    userId,
    profile
  );
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

  if (!shouldShowOnboarding(profile)) {
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
