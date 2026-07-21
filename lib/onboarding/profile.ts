import type { SupabaseClient } from "@supabase/supabase-js";

import type { OnboardingStep } from "@/lib/onboarding/types";

export async function saveOnboardingStep(
  supabase: SupabaseClient,
  userId: string,
  step: OnboardingStep
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_step: step,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function skipOnboarding(
  supabase: SupabaseClient,
  userId: string,
  step: OnboardingStep
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_skipped_at:
        new Date().toISOString(),
      onboarding_step: step,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function completeOnboarding(
  supabase: SupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed_at:
        new Date().toISOString(),
      onboarding_step: "complete",
      onboarding_skipped_at: null,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function restartOnboardingProfile(
  supabase: SupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: null,
      onboarding_skipped_at: null,
      onboarding_step: "welcome",
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function saveHomeName(
  supabase: SupabaseClient,
  userId: string,
  householdName: string
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      household_name:
        householdName.trim(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
