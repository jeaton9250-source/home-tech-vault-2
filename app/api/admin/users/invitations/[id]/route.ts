import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resendAdminUserInvitation,
  revokeAdminUserInvitation,
} from "@/lib/admin/invitations";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requirePlatformAdminSession();
    const admin = createAdminClient();
    const { id } = await context.params;
    const inviteRoutePath = new URL(request.url).pathname;

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", session.userId)
      .maybeSingle();

    const result = await resendAdminUserInvitation({
      admin,
      actor: {
        userId: session.userId,
        email: session.email,
        fullName: profile?.full_name ?? null,
      },
      invitationId: id,
      inviteRoutePath,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: result.message,
    });
  } catch (error) {
    const accessResponse = platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin invitation resend error:", error);

    return NextResponse.json(
      { error: "Unable to resend the invitation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    await requirePlatformAdminSession();
    const admin = createAdminClient();
    const { id } = await context.params;

    const result = await revokeAdminUserInvitation({
      admin,
      invitationId: id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: result.message,
    });
  } catch (error) {
    const accessResponse = platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin invitation revoke error:", error);

    return NextResponse.json(
      { error: "Unable to revoke the invitation." },
      { status: 500 }
    );
  }
}
