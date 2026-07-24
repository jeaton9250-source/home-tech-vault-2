import { NextResponse } from "next/server";

import {
  findPendingCreateAccountInvitation,
} from "@/lib/invite/createAccountHousehold";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

    const admin = createAdminClient();
    const invitation =
      await findPendingCreateAccountInvitation(
        admin,
        user.email || ""
      );

    if (!invitation) {
      return NextResponse.json(
        {
          error:
            "No pending create-account invitation was found for this email.",
        },
        { status: 404 }
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

    const metadata = user.user_metadata as Record<
      string,
      unknown
    >;

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
        invitationType: invitation.invitation_type,
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
