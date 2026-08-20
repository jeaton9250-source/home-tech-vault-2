import { NextResponse } from "next/server";

import { permanentlyDeleteUser } from "@/lib/account-admin/deletion";
import { isDestructiveActionRateLimited } from "@/lib/account-admin/rateLimit";
import { DELETION_REASONS } from "@/lib/account-admin/constants";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DeleteUserBody = {
  reason?: string;
  notes?: string | null;
  confirmText?: string;
  transferOwnerUserId?: string | null;
  deleteHouseholdData?: boolean;
  confirmIrreversible?: boolean;
};

const VALID_REASON_IDS = new Set(
  DELETION_REASONS.map((entry) => entry.id)
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession(request);

    const { id: targetUserId } =
      await context.params;

    if (!UUID_PATTERN.test(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user id." },
        { status: 400 }
      );
    }

    if (session.userId === targetUserId) {
      return NextResponse.json(
        {
          error:
            "You cannot permanently delete your own account from the Control Center.",
          stage: "authorization",
        },
        { status: 400 }
      );
    }

    const body =
      (await request.json()) as DeleteUserBody;

    if (body.confirmIrreversible !== true) {
      return NextResponse.json(
        {
          error:
            "Irreversible confirmation is required for permanent deletion.",
          stage: "authorization",
        },
        { status: 400 }
      );
    }

    const reason = body.reason?.trim();

    if (!reason || !VALID_REASON_IDS.has(reason as never)) {
      return NextResponse.json(
        {
          error:
            "A valid deletion reason is required.",
          stage: "authorization",
        },
        { status: 400 }
      );
    }

    const confirmText = body.confirmText?.trim();

    if (confirmText !== "DELETE") {
      return NextResponse.json(
        {
          error:
            "Type DELETE to confirm permanent deletion.",
          stage: "authorization",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    if (
      await isDestructiveActionRateLimited(
        admin,
        session.userId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Too many deletion actions. Try again in a few minutes.",
          stage: "authorization",
        },
        { status: 429 }
      );
    }

    const result = await permanentlyDeleteUser(
      admin,
      {
        targetUserId,
        actorId: session.userId,
        reason,
        notes: body.notes ?? null,
        confirmText,
        transferOwnerUserId:
          body.transferOwnerUserId ?? null,
        deleteHouseholdData:
          body.deleteHouseholdData === true,
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.message,
          stage: result.stage,
          code: "code" in result ? result.code : undefined,
          preview: result.preview ?? null,
          job: result.job ?? null,
          jobView: result.jobView ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      deleted: true,
      message:
        "User permanently deleted from Home Tech Vault and Supabase Authentication.",
      job: result.job,
      jobView: result.jobView,
      preview: result.preview,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin permanent user deletion error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to permanently delete this user.",
        stage: "application_cleanup",
      },
      { status: 500 }
    );
  }
}
