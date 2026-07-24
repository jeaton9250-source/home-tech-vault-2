import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildCreateAccountInviteCallbackUrl } from "@/lib/admin/inviteAuthRedirect";
import {
  getInvitationTypeFromRow,
  loadInvitationByToken,
  normalizeInviteEmail,
} from "@/lib/admin/invitations";
import { INVITATION_TYPE_CREATE_ACCOUNT } from "@/lib/admin/invitationTypes";
import { generateCreateAccountSecureInviteLink } from "@/lib/admin/secureInviteLink";
import { absoluteUrl } from "@/lib/marketing/site";

export function buildCreateAccountInviteContinueUrl(
  invitationToken: string
) {
  return absoluteUrl(
    `/auth/invite/continue?token=${encodeURIComponent(invitationToken)}`
  );
}

function invitationIsExpired(expiresAt: string) {
  const expiresMs = new Date(expiresAt).getTime();

  return (
    Number.isFinite(expiresMs) &&
    expiresMs < Date.now()
  );
}

function buildCreateAccountAuthInviteMetadata(input: {
  firstName?: string | null;
  lastName?: string | null;
  invitationToken: string;
  invitedByPlatformAdmin: string;
}) {
  const firstName = input.firstName?.trim() || "";
  const lastName = input.lastName?.trim() || "";
  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    full_name: fullName || undefined,
    invitation_type: INVITATION_TYPE_CREATE_ACCOUNT,
    onboarding_mode: "create_household",
    platform_access: "standard_user",
    invited_by_platform_admin:
      input.invitedByPlatformAdmin,
    invitation_token: input.invitationToken,
  };
}

export async function resolveCreateAccountInviteSecureLink(
  admin: SupabaseClient,
  invitationToken: string
) {
  const invitation = await loadInvitationByToken(
    admin,
    invitationToken
  );

  if (!invitation || invitation.accepted_at) {
    return {
      ok: false as const,
      status: 404,
      error: "This invitation is invalid or already used.",
    };
  }

  if (invitationIsExpired(invitation.expires_at)) {
    return {
      ok: false as const,
      status: 410,
      error: "This invitation has expired.",
    };
  }

  const invitationType =
    getInvitationTypeFromRow(invitation);

  if (
    invitationType !==
    INVITATION_TYPE_CREATE_ACCOUNT
  ) {
    return {
      ok: false as const,
      status: 400,
      error:
        "This invitation is not for creating a new account.",
    };
  }

  const invitedBy =
    invitation.invited_by?.trim() ||
    invitation.invited_by;

  if (!invitedBy) {
    return {
      ok: false as const,
      status: 400,
      error:
        "This invitation is missing administrator details.",
    };
  }

  const redirectTo =
    buildCreateAccountInviteCallbackUrl();
  const metadata =
    buildCreateAccountAuthInviteMetadata({
      firstName: invitation.first_name,
      lastName: invitation.last_name,
      invitationToken: invitation.token,
      invitedByPlatformAdmin: invitedBy,
    });

  const generatedLink =
    await generateCreateAccountSecureInviteLink(
      admin,
      {
        email: normalizeInviteEmail(
          invitation.email
        ),
        metadata,
        redirectTo,
      }
    );

  if (!generatedLink.ok) {
    const linkError = generatedLink.error as {
      message?: string;
    };

    return {
      ok: false as const,
      status: 500,
      error:
        linkError.message ||
        "Unable to generate a secure invitation link.",
    };
  }

  return {
    ok: true as const,
    redirectUrl: generatedLink.secureActionUrl,
    email: normalizeInviteEmail(invitation.email),
  };
}
