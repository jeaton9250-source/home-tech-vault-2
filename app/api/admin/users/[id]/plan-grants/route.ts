import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { isGrantLogicallyExpired } from "@/lib/plan-grants/grantAccess";
import { loadLatestPlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import {
  createPlatformPlanGrant,
  PlanGrantValidationError,
  revokePlatformPlanGrant,
} from "@/lib/plan-grants/mutations";
import {
  isAdminGrantPlan,
  PLAN_GRANT_DURATIONS,
  PLAN_GRANT_REASONS,
} from "@/lib/plan-grants/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const adminSession =
      await requirePlatformAdminSession();
    const { id: targetUserId } =
      await context.params;

    const body =
      (await request.json()) as {
        plan?: string;
        durationId?: string;
        customExpiresAt?: string | null;
        reason?: string;
        notes?: string | null;
        confirm?: boolean;
      };

    if (
      !body.plan ||
      !isAdminGrantPlan(body.plan)
    ) {
      return NextResponse.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }

    if (
      !body.durationId ||
      !PLAN_GRANT_DURATIONS.some(
        (duration) =>
          duration.id === body.durationId
      )
    ) {
      return NextResponse.json(
        { error: "Invalid duration." },
        { status: 400 }
      );
    }

    if (
      !body.reason ||
      !PLAN_GRANT_REASONS.includes(
        body.reason as (typeof PLAN_GRANT_REASONS)[number]
      )
    ) {
      return NextResponse.json(
        { error: "A valid reason is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const grant =
      await createPlatformPlanGrant(
        supabase,
        {
          targetUserId,
          actorId: adminSession.userId,
          plan: body.plan,
          durationId: body.durationId,
          customExpiresAt:
            body.customExpiresAt,
          reason: body.reason,
          notes: body.notes,
          confirm: body.confirm === true,
        }
      );

    return NextResponse.json({
      grant,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    if (
      error instanceof PlanGrantValidationError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Plan grant create error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create plan grant.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const adminSession =
      await requirePlatformAdminSession();
    const { id: targetUserId } =
      await context.params;

    const body =
      (await request.json()) as {
        confirm?: boolean;
        revocationReason?: string | null;
      };

    const supabase = await createClient();

    const revokedGrant =
      await revokePlatformPlanGrant(
        supabase,
        {
          targetUserId,
          actorId: adminSession.userId,
          revocationReason:
            body.revocationReason,
          confirm: body.confirm === true,
        }
      );

    if (!revokedGrant) {
      const latestGrant =
        await loadLatestPlanGrantForUser(
          supabase,
          targetUserId
        );

      if (
        latestGrant &&
        isGrantLogicallyExpired(latestGrant)
      ) {
        return NextResponse.json(
          {
            error:
              "This grant has already expired.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "No active grant found for this user.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      grant: revokedGrant,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    if (
      error instanceof PlanGrantValidationError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Plan grant revoke error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to revoke plan grant.",
      },
      { status: 500 }
    );
  }
}
