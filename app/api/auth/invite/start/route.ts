import { NextResponse } from "next/server";

import { resolveCreateAccountInviteSecureLink } from "@/lib/auth/inviteContinue";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InviteStartBody = {
  token?: unknown;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as InviteStartBody;
    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const result =
      await resolveCreateAccountInviteSecureLink(
        admin,
        token
      );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    console.info("Create-account invite start", {
      email: result.email,
      hasRedirectUrl: Boolean(result.redirectUrl),
    });

    return NextResponse.json({
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error(
      "[invite-start] unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start invitation setup.",
      },
      { status: 500 }
    );
  }
}
