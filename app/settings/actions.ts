"use server";

import { revalidatePath } from "next/cache";

import {
  validateProfileInput,
  type ProfileInput,
} from "@/lib/account-settings/profileInputValidation";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileSettingsResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      code:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "UNKNOWN";
    };

export async function updateProfileSettings(
  input: ProfileInput
): Promise<UpdateProfileSettingsResult> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to update your profile.",
      code: "UNAUTHENTICATED",
    };
  }

  const validation =
    validateProfileInput(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const profile =
    validation.data;

  const { error } =
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name:
            profile.fullName,
          household_name:
            profile.householdName,
          city:
            profile.city,
          phone:
            profile.phone,
        },
        {
          onConflict: "id",
        }
      );

  if (error) {
    console.error(
      "Unable to update profile settings:",
      error
    );

    return {
      success: false,
      error:
        "Unable to save your profile right now.",
      code: "UNKNOWN",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}
