import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getErrorMessage,
  isOnboardingSchemaError,
  readLocalOnboardingState,
  writeLocalOnboardingState,
} from "@/lib/onboarding/clientStorage";

import type { OnboardingStep } from "@/lib/onboarding/types";

async function upsertOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>
) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        ...patch,
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    if (isOnboardingSchemaError(error)) {
      writeLocalOnboardingState(
        userId,
        patch as {
          onboarding_completed_at?:
            | string
            | null;
          onboarding_step?: OnboardingStep | null;
          onboarding_skipped_at?:
            | string
            | null;
        }
      );
      return;
    }

    throw error;
  }
}

export async function saveOnboardingStep(
  supabase: SupabaseClient,
  userId: string,
  step: OnboardingStep
) {
  await upsertOnboardingProfile(
    supabase,
    userId,
    {
      onboarding_step: step,
    }
  );
}

export async function skipOnboarding(
  supabase: SupabaseClient,
  userId: string,
  step: OnboardingStep
) {
  await upsertOnboardingProfile(
    supabase,
    userId,
    {
      onboarding_skipped_at:
        new Date().toISOString(),
      onboarding_step: step,
    }
  );
}

export async function completeOnboarding(
  supabase: SupabaseClient,
  userId: string
) {
  await upsertOnboardingProfile(
    supabase,
    userId,
    {
      onboarding_completed_at:
        new Date().toISOString(),
      onboarding_step: "complete",
      onboarding_skipped_at: null,
    }
  );
}

export async function restartOnboardingProfile(
  supabase: SupabaseClient,
  userId: string
) {
  await upsertOnboardingProfile(
    supabase,
    userId,
    {
      onboarding_completed_at: null,
      onboarding_skipped_at: null,
      onboarding_step: "welcome",
    }
  );
}

export async function saveHomeName(
  supabase: SupabaseClient,
  userId: string,
  householdName: string
) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        household_name:
          householdName.trim(),
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to save your home name."
      )
    );
  }
}
