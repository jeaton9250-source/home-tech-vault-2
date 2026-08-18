import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

import {
  createAuthVerificationClient,
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  recordPlatformAdminAudit,
} from "@/lib/account-admin/audit";

import {
  assertImpersonationRateLimit,
  assertSameOrigin,
  createOpaqueImpersonationToken,
  encryptAdminSession,
  hashImpersonationToken,
  IMPERSONATION_MAX_AGE_SECONDS,
  setImpersonationCookie,
  clearImpersonationCookie,
} from "@/lib/admin/impersonation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  let impersonationSessionId:
    | string
    | null = null;

  try {
    assertSameOrigin(request);

    const platformAdmin =
      await requirePlatformAdminSession();

    await assertImpersonationRateLimit(
      platformAdmin.userId
    );

    const { id: targetUserId } =
      await context.params;

    if (!targetUserId) {
      return NextResponse.json(
        {
          error:
            "Missing target user.",
        },
        { status: 400 }
      );
    }

    if (
      targetUserId ===
      platformAdmin.userId
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot impersonate your own admin account.",
        },
        { status: 400 }
      );
    }

    /*
     * Capture the real administrator
     * session BEFORE any auth switch.
     */
    const supabase =
      await createClient();

    const {
      data: { session },
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (
      sessionError ||
      !session ||
      session.user.id !==
        platformAdmin.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to capture the administrator session.",
        },
        { status: 401 }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: targetResult,
      error: targetError,
    } =
      await admin.auth.admin.getUserById(
        targetUserId
      );

    const targetUser =
      targetResult?.user;

    if (
      targetError ||
      !targetUser
    ) {
      return NextResponse.json(
        {
          error:
            "User not found.",
        },
        { status: 404 }
      );
    }

    const {
      data: targetProfile,
      error: targetProfileError,
    } = await admin
      .from("profiles")
      .select(
        "is_admin, full_name"
      )
      .eq(
        "id",
        targetUserId
      )
      .maybeSingle();

    if (targetProfileError) {
      throw targetProfileError;
    }

    if (
      targetProfile?.is_admin === true
    ) {
      return NextResponse.json(
        {
          error:
            "Platform administrators cannot be impersonated.",
        },
        { status: 403 }
      );
    }

    const targetEmail =
      targetUser.email?.trim() ||
      null;

    if (!targetEmail) {
      return NextResponse.json(
        {
          error:
            "This account does not have an email address.",
        },
        { status: 400 }
      );
    }

    /*
     * Create SERVER-SIDE recovery state
     * before switching browser identity.
     *
     * The browser receives only the random
     * opaque token below.
     */
    const opaqueToken =
      createOpaqueImpersonationToken();

    const tokenHash =
      hashImpersonationToken(
        opaqueToken
      );

    const encryptedAdminSession =
      encryptAdminSession({
        accessToken:
          session.access_token,
        refreshToken:
          session.refresh_token,
      });

    const now =
      new Date();

    const expiresAt =
      new Date(
        now.getTime() +
          IMPERSONATION_MAX_AGE_SECONDS *
            1000
      );

    const {
      data: storedSession,
      error: storedSessionError,
    } = await admin
      .from(
        "admin_impersonation_sessions"
      )
      .insert({
        token_hash:
          tokenHash,

        admin_user_id:
          platformAdmin.userId,

        target_user_id:
          targetUserId,

        admin_email_snapshot:
          platformAdmin.email,

        target_email_snapshot:
          targetEmail,

        target_name_snapshot:
          targetProfile?.full_name?.trim() ||
          null,

        encrypted_admin_session:
          encryptedAdminSession,

        status: "pending",

        started_at:
          now.toISOString(),

        expires_at:
          expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (
      storedSessionError ||
      !storedSession
    ) {
      throw (
        storedSessionError ||
        new Error(
          "Unable to create impersonation recovery state."
        )
      );
    }

    impersonationSessionId =
      storedSession.id;

    /*
     * Set the opaque recovery cookie before
     * changing Supabase auth. If anything
     * crashes after the identity switch,
     * Exit impersonation can still recover
     * the administrator.
     */
    await setImpersonationCookie(
      opaqueToken
    );

    const {
      data: linkData,
      error: linkError,
    } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: targetEmail,
      });

    if (linkError) {
      throw linkError;
    }

    const tokenHashForOtp =
      linkData?.properties
        ?.hashed_token;

    if (!tokenHashForOtp) {
      throw new Error(
        "Supabase did not return an impersonation token."
      );
    }

    const verificationClient =
      await createAuthVerificationClient();

    const {
      data: verificationData,
      error: verificationError,
    } =
      await verificationClient.auth.verifyOtp({
        type: "magiclink",
        token_hash:
          tokenHashForOtp,
      });

    if (
      verificationError ||
      !verificationData.session ||
      verificationData.user?.id !==
        targetUserId
    ) {
      throw (
        verificationError ||
        new Error(
          "Unable to establish target user session."
        )
      );
    }

    /*
     * Promote pending -> active.
     *
     * Even if this update unexpectedly
     * fails, the pending record and opaque
     * cookie are still recoverable by the
     * exit/status routes.
     */
    const {
      error: activationError,
    } = await admin
      .from(
        "admin_impersonation_sessions"
      )
      .update({
        status: "active",
      })
      .eq(
        "id",
        storedSession.id
      )
      .eq(
        "status",
        "pending"
      );

    if (activationError) {
      console.error(
        "Unable to mark impersonation session active:",
        activationError
      );
    }

    /*
     * Existing audit table remains useful,
     * while admin_impersonation_sessions
     * itself is now a durable authoritative
     * record of the session lifecycle.
     */
    await recordPlatformAdminAudit(
      admin,
      {
        eventType:
          "impersonation_started",

        actorId:
          platformAdmin.userId,

        targetUserId,

        targetEmailSnapshot:
          targetEmail,

        notes:
          "Platform administrator started a user impersonation session.",

        metadata: {
          impersonation_session_id:
            storedSession.id,

          expires_in_seconds:
            IMPERSONATION_MAX_AGE_SECONDS,
        },
      }
    );

    return NextResponse.json({
      ok: true,

      target: {
        id: targetUserId,
        email: targetEmail,
        name:
          targetProfile?.full_name ||
          null,
      },

      redirectTo:
        "/dashboard",
    });
  } catch (error) {
    /*
     * If failure happened BEFORE successful
     * target auth, retire any server-side
     * pending recovery state.
     *
     * If failure happened after OTP changed
     * auth, preserving the opaque cookie +
     * pending row is safer than deleting
     * recovery state. Therefore we inspect
     * the current authenticated user.
     */
    if (impersonationSessionId) {
      try {
        const supabase =
          await createClient();

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        const admin =
          createAdminClient();

        const {
          data: row,
        } = await admin
          .from(
            "admin_impersonation_sessions"
          )
          .select(
            "target_user_id"
          )
          .eq(
            "id",
            impersonationSessionId
          )
          .maybeSingle();

        const switchedToTarget =
          Boolean(
            user &&
              row &&
              user.id ===
                row.target_user_id
          );

        if (!switchedToTarget) {
          await admin
            .from(
              "admin_impersonation_sessions"
            )
            .update({
              status: "failed",
              failure_reason:
                error instanceof Error
                  ? error.message.slice(
                      0,
                      500
                    )
                  : "Unknown impersonation failure.",
              ended_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              impersonationSessionId
            );

          await clearImpersonationCookie();
        }
      } catch (
        cleanupError
      ) {
        console.error(
          "Unable to clean failed impersonation session:",
          cleanupError
        );
      }
    }

    const adminResponse =
      platformAdminAccessResponse(
        error
      );

    if (adminResponse) {
      return adminResponse;
    }

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

    if (
      error instanceof Error &&
      error.message ===
        "IMPERSONATION_RATE_LIMITED"
    ) {
      return NextResponse.json(
        {
          error:
            "Too many impersonation sessions were started recently. Please wait a few minutes and try again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After":
              "600",
          },
        }
      );
    }

    console.error(
      "Unable to start impersonation:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start impersonation.",
      },
      { status: 500 }
    );
  }
}
