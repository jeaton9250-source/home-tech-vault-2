import "server-only";

import type { EmailOtpType } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCreateAccountInviteRedirectUrl } from "@/lib/admin/inviteAuthRedirect";
import { buildAuthConfirmUrl } from "@/lib/auth/buildAuthConfirmUrl";
import {
  assertValidEmailTokenHash,
  tokenLooksLikeJwt,
} from "@/lib/auth/emailTokenHash";

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

function logGeneratedCreateAccountInvite(
  properties: {
    hashed_token?: string;
    action_link?: string;
  } | null
  | undefined
) {
  const tokenHash = properties?.hashed_token;

  console.info("Generated create-account invite", {
    hasHashedToken:
      typeof tokenHash === "string",
    tokenLength:
      typeof tokenHash === "string"
        ? tokenHash.length
        : null,
    tokenLooksLikeJwt:
      typeof tokenHash === "string"
        ? tokenLooksLikeJwt(tokenHash)
        : null,
    hasActionLink: Boolean(
      properties?.action_link
    ),
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

  const properties = data.properties;
  const tokenHash = properties?.hashed_token ?? null;

  logGeneratedCreateAccountInvite(properties);

  try {
    assertValidEmailTokenHash(tokenHash);
  } catch (validationError) {
    return {
      ok: false as const,
      redirectTo,
      error:
        validationError instanceof Error
          ? validationError
          : new Error(
              "Supabase did not return a valid invitation token hash."
            ),
    };
  }

  const confirmUrl = buildAuthConfirmUrl({
    tokenHash,
    type: "invite" as EmailOtpType,
    next: confirmNext,
  });

  return {
    ok: true as const,
    redirectTo,
    confirmUrl,
  };
}
