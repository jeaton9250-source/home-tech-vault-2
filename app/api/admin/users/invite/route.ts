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

function logInviteRoute(
  stage: string,
  details?: Record<string, unknown>
) {
  console.info("[admin-invite-route]", stage, details ?? {});
}

export async function POST(request: Request) {
  try {
    logInviteRoute("authenticate_requester");

    const session = await requirePlatformAdminSession();

    logInviteRoute("requester_authorized", {
      userId: session.userId,
    });

    let admin;

    try {
      admin = createAdminClient();
    } catch (configError) {
      console.error(
        "[admin-invite-route] admin client configuration error:",
        configError
      );

      return NextResponse.json(
        {
          error:
            "Server configuration is incomplete. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY on the server.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      invitationType?: string;
      email?: string;
      householdId?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      accountRole?: string;
      createOwnHousehold?: boolean;
    };

    const invitationType =
      parseInvitationType(body.invitationType) ??
      (body.createOwnHousehold === false
        ? "household_member"
        : "new_account");

    logInviteRoute("validate_payload", {
      invitationType,
      email:
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "",
    });

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
        firstName:
          body.firstName ??
          (typeof body.fullName === "string"
            ? body.fullName.trim().split(/\s+/)[0]
            : undefined),
        lastName:
          body.lastName ??
          (typeof body.fullName === "string"
            ? body.fullName.trim().split(/\s+/).slice(1).join(" ")
            : undefined),
      },
    });

    if (!result.ok) {
      logInviteRoute("invite_failed", {
        status: result.status,
        error: result.error,
      });

      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    logInviteRoute("invite_succeeded", {
      email:
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "",
      delivery: result.delivery,
    });

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      delivery: result.delivery,
      warning: result.deliveryWarning,
      message: result.message,
    });
  } catch (error) {
    const accessResponse = platformAdminAccessResponse(error);

    if (accessResponse) {
      logInviteRoute("authorization_failed");

      return accessResponse;
    }

    console.error("[admin-invite-route] unexpected error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while sending the invitation.",
      },
      { status: 500 }
    );
  }
}
