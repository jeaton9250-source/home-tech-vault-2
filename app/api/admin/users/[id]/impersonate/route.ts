import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import {
  createAuthVerificationClient,
  createClient,
} from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import {
  assertSameOrigin,
  IMPERSONATION_MAX_AGE_SECONDS,
  setImpersonationRecovery,
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
  try {
    assertSameOrigin(request);

    const platformAdmin =
      await requirePlatformAdminSession();

    const { id: targetUserId } =
      await context.params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing target user." },
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
     * Capture the ORIGINAL authenticated admin
     * session before changing anything.
     */
    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

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

    const admin = createAdminClient();

    const {
      data: targetAuthResult,
      error: targetAuthError,
    } =
      await admin.auth.admin.getUserById(
        targetUserId
      );

    const targetUser =
      targetAuthResult?.user;

    if (
      targetAuthError ||
      !targetUser
    ) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const {
      data: targetProfile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select("is_admin, full_name")
      .eq("id", targetUserId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    /*
     * Never impersonate another platform
     * administrator.
     */
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
      targetUser.email?.trim() || null;

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
     * Supabase Admin generates the OTP
     * internally. The token is never sent
     * to the browser or to the target user.
     */
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

    const tokenHash =
      linkData?.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error(
        "Supabase did not return an impersonation token."
      );
    }

    /*
     * Use the project's special auth
     * verification client so the request
     * does not inherit the admin JWT while
     * verifying the target OTP.
     */
    const verificationClient =
      await createAuthVerificationClient();

    const {
      data: verificationData,
      error: verificationError,
    } =
      await verificationClient.auth.verifyOtp(
        {
          type: "magiclink",
          token_hash: tokenHash,
        }
      );

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

    const now = Date.now();

    await setImpersonationRecovery({
      adminUserId:
        platformAdmin.userId,
      adminEmail:
        platformAdmin.email,

      adminAccessToken:
        session.access_token,
      adminRefreshToken:
        session.refresh_token,

      targetUserId,
      targetEmail,
      targetName:
        targetProfile?.full_name?.trim() ||
        null,

      issuedAt: now,
      expiresAt:
        now +
        IMPERSONATION_MAX_AGE_SECONDS *
          1000,
    });

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
      redirectTo: "/dashboard",
    });
  } catch (error) {
    const adminResponse =
      platformAdminAccessResponse(error);

    if (adminResponse) {
      return adminResponse;
    }

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
