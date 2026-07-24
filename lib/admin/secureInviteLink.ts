import "server-only";

import type { EmailOtpType } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCreateAccountInviteRedirectUrl } from "@/lib/admin/inviteAuthRedirect";
import { buildAuthConfirmUrl } from "@/lib/auth/buildAuthConfirmUrl";

export function assertInviteTokenHash(
  value: unknown
): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      "Supabase did not return an invitation token hash."
    );
  }
}

export function logCreateAccountInviteLink(input: {
  deliveryMethod: "supabase" | "resend";
  redirectTo: string;
  usesTokenHashConfirm: boolean;
}) {
  console.info("Create-account invite link", {
    deliveryMethod: input.deliveryMethod,
    redirectTo: input.redirectTo,
    usesTokenHashConfirm:
      input.usesTokenHashConfirm,
  });
}

export async function generateCreateAccountSecureInviteLink(
  admin: SupabaseClient,
  input: {
    email: string;
    metadata: Record<string, unknown>;
    redirectTo?: string;
    confirmNext?: string;
  }
) {
  const redirectTo =
    input.redirectTo ??
    buildCreateAccountInviteRedirectUrl();
  const confirmNext =
    input.confirmNext ?? "/invite/setup";

  const { data, error } =
    await admin.auth.admin.generateLink({
      type: "invite",
      email: input.email,
      options: {
        redirectTo,
        data: input.metadata,
      },
    });

  if (error) {
    console.error(
      "[admin-invite] generateLink failed:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return {
      ok: false as const,
      redirectTo,
      error,
    };
  }

  const hashedToken =
    data.properties?.hashed_token ?? null;

  try {
    assertInviteTokenHash(hashedToken);
  } catch (validationError) {
    return {
      ok: false as const,
      redirectTo,
      error:
        validationError instanceof Error
          ? validationError
          : new Error(
              "Supabase did not return an invitation token hash."
            ),
    };
  }

  const confirmUrl = buildAuthConfirmUrl({
    tokenHash: hashedToken,
    type: "invite" as EmailOtpType,
    next: confirmNext,
  });

  return {
    ok: true as const,
    redirectTo,
    confirmUrl,
  };
}
