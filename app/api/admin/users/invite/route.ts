import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createAdminUserInvitation,
  parseInvitationType,
} from "@/lib/admin/invitations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requirePlatformAdminSession();
    const admin = createAdminClient();

    const body = (await request.json()) as {
      invitationType?: string;
      email?: string;
      householdId?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
    };

    const invitationType =
      parseInvitationType(body.invitationType) ?? "new_account";

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
        invitationType,
        email: body.email ?? "",
        householdId: body.householdId ?? null,
        role: (body.role as "admin" | "member" | "viewer") ?? null,
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
