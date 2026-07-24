import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCreateAccountInviteCallbackUrl } from "@/lib/admin/inviteAuthRedirect";

export function assertSecureInviteActionUrl(
  value: unknown
): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      "Supabase did not return an invitation action link."
    );
  }

  const parsed = new URL(value);

  const isSupabaseAuthLink =
    parsed.pathname.includes("/auth/v1/verify") ||
    parsed.searchParams.has("token") ||
    parsed.searchParams.has("token_hash");

  if (!isSupabaseAuthLink) {
    throw new Error(
      "The invitation email URL is not a secure Supabase authentication link."
    );
  }
}

export function logCreateAccountInviteLink(input: {
  deliveryMethod: "supabase" | "resend";
  redirectTo: string;
  secureActionUrl?: string | null;
}) {
  let actionUrlHost: string | null = null;

  if (input.secureActionUrl) {
    try {
      actionUrlHost = new URL(input.secureActionUrl).host;
    } catch {
      actionUrlHost = null;
    }
  }

  console.info("Create-account invite link", {
    deliveryMethod: input.deliveryMethod,
    redirectTo: input.redirectTo,
    hasSecureActionUrl: Boolean(input.secureActionUrl),
    actionUrlHost,
  });
}

export async function generateCreateAccountSecureInviteLink(
  admin: SupabaseClient,
  input: {
    email: string;
    metadata: Record<string, unknown>;
    redirectTo?: string;
  }
) {
  const redirectTo =
    input.redirectTo ??
    buildCreateAccountInviteCallbackUrl();

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

  const secureActionUrl =
    data.properties?.action_link ?? null;

  try {
    assertSecureInviteActionUrl(secureActionUrl);
  } catch (validationError) {
    return {
      ok: false as const,
      redirectTo,
      error:
        validationError instanceof Error
          ? validationError
          : new Error(
              "Supabase did not return an invitation action link."
            ),
    };
  }

  return {
    ok: true as const,
    redirectTo,
    secureActionUrl,
  };
}
