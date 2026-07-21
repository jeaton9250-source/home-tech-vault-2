import { NextResponse } from "next/server";

import {
  deactivateAccount,
  reactivateAccount,
} from "@/lib/account-admin/status";
import { isDestructiveActionRateLimited } from "@/lib/account-admin/rateLimit";
import { loadAdminUserDetail } from "@/lib/admin/data/loaders";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AccountStatusPatchBody = {
  action?: "deactivate" | "reactivate";
  reason?: string;
  notes?: string;
  confirm?: boolean;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const body =
      (await request.json()) as AccountStatusPatchBody;

    if (body.confirm !== true) {
      return NextResponse.json(
        {
          error:
            "Confirmation is required for account status changes.",
        },
        { status: 400 }
      );
    }

    if (
      body.action !== "deactivate" &&
      body.action !== "reactivate"
    ) {
      return NextResponse.json(
        {
          error:
            "action must be deactivate or reactivate.",
        },
        { status: 400 }
      );
    }

    const targetUser =
      await loadAdminUserDetail(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
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
            "Too many account actions. Try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    if (body.action === "deactivate") {
      const reason = body.reason?.trim();

      if (!reason) {
        return NextResponse.json(
          {
            error:
              "A deactivation reason is required.",
          },
          { status: 400 }
        );
      }

      await deactivateAccount(admin, {
        targetUserId: id,
        actorId: session.userId,
        reason,
        notes: body.notes ?? null,
        targetEmail: targetUser.email,
      });
    } else {
      await reactivateAccount(admin, {
        targetUserId: id,
        actorId: session.userId,
        notes: body.notes ?? null,
        targetEmail: targetUser.email,
      });
    }

    const user = await loadAdminUserDetail(id);

    return NextResponse.json({ user });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin account status mutation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update account status.",
      },
      { status: 500 }
    );
  }
}
