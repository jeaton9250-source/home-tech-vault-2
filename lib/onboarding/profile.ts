import type { SupabaseClient } from "@supabase/supabase-js";

import {
  clearLocalOnboardingState,
  getErrorMessage,
  isOnboardingSchemaError,
  type LocalOnboardingState,
  writeLocalOnboardingState,
} from "@/lib/onboarding/clientStorage";

import type { OnboardingStep } from "@/lib/onboarding/types";

async function upsertOnboardingProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>
) {
  const localPatch =
    patch as Partial<LocalOnboardingState>;

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isOnboardingSchemaError(error)) {
      writeLocalOnboardingState(
        userId,
        localPatch
      );
      return;
    }

    throw error;
  }

  if (!data) {
    const { error: upsertError } =
      await supabase
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

    if (upsertError) {
      if (
        isOnboardingSchemaError(
          upsertError
        )
      ) {
        writeLocalOnboardingState(
          userId,
          localPatch
        );
        return;
      }

      writeLocalOnboardingState(
        userId,
        localPatch
      );
      console.error(
        "Unable to persist onboarding profile:",
        upsertError
      );
      return;
    }
  }

  writeLocalOnboardingState(
    userId,
    localPatch
  );
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
  clearLocalOnboardingState(userId);

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
  _supabase: SupabaseClient,
  _userId: string,
  householdName: string
) {
  const name =
    householdName.trim();

  if (!name) {
    throw new Error(
      "Enter a household name."
    );
  }

  const response =
    await fetch(
      "/api/household/ensure",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          householdName: name,
        }),
      }
    );

  const payload =
    (await response.json()) as {
      error?: string;
    };

  if (!response.ok) {
    throw new Error(
      payload.error ||
        "Unable to save your home name."
    );
  }
}
