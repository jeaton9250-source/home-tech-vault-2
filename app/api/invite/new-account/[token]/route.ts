import { NextResponse } from "next/server";

import {
  acceptNewAccountInvitation,
  getInvitationTypeFromRow,
  loadInvitationByToken,
  normalizeInviteEmail,
} from "@/lib/admin/invitations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { token: rawToken } = await context.params;
    const token = decodeURIComponent(rawToken || "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sign in required." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const invitation = await loadInvitationByToken(admin, token);

    if (!invitation || invitation.accepted_at) {
      return NextResponse.json(
        { error: "This invitation is invalid or already used." },
        { status: 404 }
      );
    }

    const invitationType = getInvitationTypeFromRow(invitation);

    if (invitationType !== "new_account") {
      return NextResponse.json(
        {
          error:
            "This invitation is for joining an existing household.",
          redirectTo: `/family/accept/${encodeURIComponent(token)}`,
        },
        { status: 400 }
      );
    }

    const inviteEmail = normalizeInviteEmail(invitation.email);
    const sessionEmail = normalizeInviteEmail(user.email || "");

    if (!sessionEmail || sessionEmail !== inviteEmail) {
      return NextResponse.json(
        {
          error:
            "Sign in with the invited email address to finish setup.",
        },
        { status: 403 }
      );
    }

    const expiresMs = new Date(invitation.expires_at).getTime();
    const expired =
      Number.isFinite(expiresMs) && expiresMs < Date.now();

    if (expired) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        firstName: invitation.first_name ?? null,
        lastName: invitation.last_name ?? null,
        expiresAt: invitation.expires_at,
        invitationType,
      },
    });
  } catch (error) {
    console.error("Load new-account invitation error:", error);

    return NextResponse.json(
      { error: "Unable to load this invitation." },
      { status: 500 }
    );
  }
}
