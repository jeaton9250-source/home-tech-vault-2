import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAdminUserInvitation,
  parseInviteRole,
} from "@/lib/admin/invitations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requirePlatformAdminSession();
    const admin = createAdminClient();

    const body = (await request.json()) as {
      email?: string;
      householdId?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
    };

    const role = parseInviteRole(body.role);

    if (!role) {
      return NextResponse.json(
        {
          error:
            "Select a household role of Admin, Member, or Viewer.",
        },
        { status: 400 }
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", session.userId)
      .maybeSingle();

    const result = await createAdminUserInvitation({
      admin,
      actor: {
        userId: session.userId,
        email: session.email,
        fullName: profile?.full_name ?? null,
      },
      payload: {
        email: body.email ?? "",
        householdId: body.householdId ?? "",
        role,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      invitation: result.invitation,
      delivery: result.delivery,
      warning: result.deliveryWarning,
      message: result.message,
    });
  } catch (error) {
    const accessResponse = platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin invite user error:", error);

    return NextResponse.json(
      { error: "Unable to send the invitation." },
      { status: 500 }
    );
  }
}
