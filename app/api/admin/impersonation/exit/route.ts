import { NextResponse } from "next/server";

import {
  assertSameOrigin,
  clearImpersonationCookie,
  getServerImpersonationSession,
} from "@/lib/admin/impersonation";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  recordPlatformAdminAudit,
} from "@/lib/account-admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    assertSameOrigin(request);

    const recovery =
      await getServerImpersonationSession();

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
    } =
      await supabase.auth.getUser();

    if (
      !currentUser ||
      currentUser.id !==
        recovery.targetUserId
    ) {
      await clearImpersonationCookie();

      return NextResponse.json(
        {
          error:
            "The active session no longer matches the impersonated user.",
        },
        { status: 409 }
      );
    }

    const admin =
      createAdminClient();

    /*
     * Never restore credentials for an
     * account that has lost platform-admin
     * authorization since impersonation
     * began.
     */
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
      await admin
        .from(
          "admin_impersonation_sessions"
        )
        .update({
          status: "revoked",
          failure_reason:
            "Original administrator no longer had platform-admin access.",
          ended_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          recovery.id
        );

      await clearImpersonationCookie();

      return NextResponse.json(
        {
          error:
            "Administrator access can no longer be restored.",
        },
        { status: 403 }
      );
    }

    const {
      data: restored,
      error: restoreError,
    } =
      await supabase.auth.setSession({
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
      console.error(
        "Unable to restore admin session:",
        restoreError
      );

      /*
       * Keep the server-side recovery row +
       * cookie intact until expiration so
       * another exit attempt may succeed.
       */
      return NextResponse.json(
        {
          error:
            "The administrator session could not be restored. You may retry, or sign out and sign back in.",
        },
        { status: 401 }
      );
    }

    const endedAt =
      new Date().toISOString();

    const {
      error: endStateError,
    } = await admin
      .from(
        "admin_impersonation_sessions"
      )
      .update({
        status: "ended",
        ended_at: endedAt,
      })
      .eq(
        "id",
        recovery.id
      )
      .in("status", [
        "pending",
        "active",
      ]);

    if (endStateError) {
      console.error(
        "Unable to mark impersonation session ended:",
        endStateError
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
          impersonation_session_id:
            recovery.id,

          started_at:
            recovery.startedAt,

          ended_at:
            endedAt,
        },
      }
    );

    await clearImpersonationCookie();

    return NextResponse.json({
      ok: true,
      redirectTo:
        "/admin/users",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ORIGIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request origin.",
        },
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
