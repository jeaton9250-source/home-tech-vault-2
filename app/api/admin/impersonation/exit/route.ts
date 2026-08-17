import { NextResponse } from "next/server";

import {
  assertSameOrigin,
  clearImpersonationRecovery,
  getImpersonationRecovery,
} from "@/lib/admin/impersonation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    assertSameOrigin(request);

    const recovery =
      await getImpersonationRecovery();

    if (!recovery) {
      return NextResponse.json(
        {
          error:
            "No active impersonation session.",
        },
        { status: 400 }
      );
    }

    const supabase =
      await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (
      !currentUser ||
      currentUser.id !==
        recovery.targetUserId
    ) {
      await clearImpersonationRecovery();

      return NextResponse.json(
        {
          error:
            "The active session no longer matches the impersonated user.",
        },
        { status: 409 }
      );
    }

    /*
     * Reconfirm that the ORIGINAL account
     * is still a platform administrator
     * before restoring its credentials.
     */
    const admin = createAdminClient();

    const {
      data: adminProfile,
      error: adminProfileError,
    } = await admin
      .from("profiles")
      .select("is_admin")
      .eq(
        "id",
        recovery.adminUserId
      )
      .maybeSingle();

    if (
      adminProfileError ||
      adminProfile?.is_admin !== true
    ) {
      await clearImpersonationRecovery();

      return NextResponse.json(
        {
          error:
            "Administrator access can no longer be restored.",
        },
        { status: 403 }
      );
    }

    /*
     * setSession will restore the original
     * admin session and refresh it if
     * necessary.
     */
    const {
      data: restored,
      error: restoreError,
    } = await supabase.auth.setSession({
      access_token:
        recovery.adminAccessToken,
      refresh_token:
        recovery.adminRefreshToken,
    });

    if (
      restoreError ||
      !restored.user ||
      restored.user.id !==
        recovery.adminUserId
    ) {
      await clearImpersonationRecovery();

      console.error(
        "Unable to restore admin session:",
        restoreError
      );

      return NextResponse.json(
        {
          error:
            "The administrator session expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    await recordPlatformAdminAudit(
      admin,
      {
        eventType:
          "impersonation_ended",
        actorId:
          recovery.adminUserId,
        targetUserId:
          recovery.targetUserId,
        targetEmailSnapshot:
          recovery.targetEmail,
        notes:
          "Platform administrator ended a user impersonation session.",
        metadata: {
          started_at:
            new Date(
              recovery.issuedAt
            ).toISOString(),
          ended_at:
            new Date().toISOString(),
        },
      }
    );

    await clearImpersonationRecovery();

    return NextResponse.json({
      ok: true,
      redirectTo: "/admin/users",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ORIGIN"
    ) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    console.error(
      "Unable to exit impersonation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to restore administrator session.",
      },
      { status: 500 }
    );
  }
}
