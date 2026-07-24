import { NextResponse } from "next/server";

import {
  INVITATION_TYPE_CREATE_ACCOUNT,
  INVITATION_TYPE_JOIN_HOUSEHOLD,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";
import {
  findPendingCreateAccountInvitation,
} from "@/lib/invite/createAccountHousehold";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invitation session required." },
        { status: 401 }
      );
    }

    const metadata = user.user_metadata as Record<
      string,
      unknown
    >;
    const metadataInvitationType =
      normalizeInvitationType(
        metadata.invitation_type
      );

    if (
      metadataInvitationType ===
      INVITATION_TYPE_JOIN_HOUSEHOLD
    ) {
      const token =
        typeof metadata.invitation_token === "string"
          ? metadata.invitation_token
          : "";

      return NextResponse.json(
        {
          error:
            "This invitation is for joining an existing household.",
          redirectTo: token
            ? `/family/accept/${encodeURIComponent(token)}`
            : "/set-password",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const invitation =
      await findPendingCreateAccountInvitation(
        admin,
        user.email || ""
      );

    if (!invitation) {
      if (
        metadataInvitationType ===
          INVITATION_TYPE_CREATE_ACCOUNT ||
        metadata.onboarding_mode === "create_household"
      ) {
        console.warn(
          "[invite-setup-session] metadata-only create_account invitation",
          {
            userId: user.id,
            email: user.email,
          }
        );

        return NextResponse.json({
          invitation: {
            email: user.email,
            firstName:
              typeof metadata.first_name === "string"
                ? metadata.first_name
                : null,
            lastName:
              typeof metadata.last_name === "string"
                ? metadata.last_name
                : null,
            expiresAt: null,
            invitationType:
              INVITATION_TYPE_CREATE_ACCOUNT,
          },
        });
      }

      return NextResponse.json(
        {
          error:
            "No pending create-account invitation was found for this email.",
        },
        { status: 404 }
      );
    }

    const invitationType = normalizeInvitationType(
      invitation.invitation_type
    );

    if (
      invitationType === INVITATION_TYPE_JOIN_HOUSEHOLD
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation is for joining an existing household.",
          redirectTo: `/family/accept/${encodeURIComponent(invitation.token)}`,
        },
        { status: 400 }
      );
    }

    const expiresMs = new Date(
      invitation.expires_at
    ).getTime();
    const expired =
      Number.isFinite(expiresMs) &&
      expiresMs < Date.now();

    if (expired) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: user.email,
        firstName:
          invitation.first_name?.trim() ||
          (typeof metadata.first_name === "string"
            ? metadata.first_name
            : null),
        lastName:
          invitation.last_name?.trim() ||
          (typeof metadata.last_name === "string"
            ? metadata.last_name
            : null),
        expiresAt: invitation.expires_at,
        invitationType:
          invitationType ??
          INVITATION_TYPE_CREATE_ACCOUNT,
      },
    });
  } catch (error) {
    console.error(
      "Load create-account invitation session error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load invitation details." },
      { status: 500 }
    );
  }
}
