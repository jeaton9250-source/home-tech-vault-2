import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { mapGrantRow } from "@/lib/plan-grants/grantAccess";
import { retryPlanGrantNotificationDelivery } from "@/lib/plan-grants/notifyAfterMutation";
import type { PlanGrantEmailEventType } from "@/lib/plan-grants/notificationTypes";
import {
  isAdminGrantPlan,
  type AdminGrantPlan,
} from "@/lib/plan-grants/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const LIVE_EVENT_TYPES: PlanGrantEmailEventType[] =
  [
    "grant_created",
    "grant_replaced",
    "grant_revoked",
  ];

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const adminSession =
      await requirePlatformAdminSession(request);
    const { id: targetUserId } =
      await context.params;

    const body =
      (await request.json()) as {
        grantId?: string;
        eventType?: string;
        eventVersion?: string;
        previousPlan?: AdminGrantPlan | null;
      };

    if (
      !body.grantId ||
      !body.eventType ||
      !body.eventVersion ||
      !LIVE_EVENT_TYPES.includes(
        body.eventType as PlanGrantEmailEventType
      )
    ) {
      return NextResponse.json(
        { error: "Invalid retry request." },
        { status: 400 }
      );
    }

    if (
      body.previousPlan &&
      !isAdminGrantPlan(body.previousPlan)
    ) {
      return NextResponse.json(
        { error: "Invalid previous plan." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("platform_plan_grants")
      .select(
        "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
      )
      .eq("id", body.grantId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Grant not found." },
        { status: 404 }
      );
    }

    const grant = mapGrantRow(data);

    const notification =
      await retryPlanGrantNotificationDelivery(
        {
          actorId: adminSession.userId,
          targetUserId,
          grant,
          eventType:
            body.eventType as PlanGrantEmailEventType,
          eventVersion: body.eventVersion,
          previousPlan:
            body.previousPlan ?? null,
        }
      );

    return NextResponse.json({
      notification,
      message:
        notification.status === "sent"
          ? "Notification sent."
          : notification.message,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Plan grant notification retry error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to retry notification.",
      },
      { status: 500 }
    );
  }
}
