import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildGrantNotificationAdminMessage,
  type GrantNotificationResult,
  type PlanGrantEmailEventType,
} from "@/lib/plan-grants/notificationTypes";
import type {
  ActivePlanGrant,
  AdminGrantPlan,
} from "@/lib/plan-grants/types";
import type {
  CreatePlanGrantResult,
  RevokePlanGrantResult,
} from "@/lib/plan-grants/mutations";
import { sendPlanGrantNotification } from "@/lib/plan-grants/sendGrantNotification";

function mapCreateEventType(
  eventType: CreatePlanGrantResult["eventType"]
): PlanGrantEmailEventType {
  return eventType === "replaced"
    ? "grant_replaced"
    : "grant_created";
}

export async function notifyAfterPlanGrantCreated(
  options: {
    actorId: string;
    targetUserId: string;
    result: CreatePlanGrantResult;
  }
): Promise<GrantNotificationResult> {
  const admin = createAdminClient();

  return sendPlanGrantNotification({
    admin,
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    grant: options.result.grant,
    eventType: mapCreateEventType(
      options.result.eventType
    ),
    previousPlan: options.result.previousPlan,
  });
}

export async function notifyAfterPlanGrantRevoked(
  options: {
    actorId: string;
    targetUserId: string;
    result: RevokePlanGrantResult;
  }
): Promise<GrantNotificationResult> {
  const admin = createAdminClient();

  return sendPlanGrantNotification({
    admin,
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    grant: options.result.grant,
    eventType: "grant_revoked",
  });
}

export function buildCreateGrantResponseMessage(
  result: CreatePlanGrantResult,
  notification: GrantNotificationResult
) {
  return buildGrantNotificationAdminMessage({
    plan: result.grant.plan,
    action: "granted",
    notification,
  });
}

export function buildRevokeGrantResponseMessage(
  result: RevokePlanGrantResult,
  notification: GrantNotificationResult
) {
  return buildGrantNotificationAdminMessage({
    plan: result.grant.plan,
    action: "revoked",
    notification,
  });
}

export type RetryPlanGrantNotificationInput = {
  actorId: string;
  targetUserId: string;
  grant: ActivePlanGrant;
  eventType: PlanGrantEmailEventType;
  eventVersion: string;
  previousPlan?: AdminGrantPlan | null;
};

export async function retryPlanGrantNotificationDelivery(
  input: RetryPlanGrantNotificationInput
) {
  const admin = createAdminClient();
  const { retryPlanGrantNotification } =
    await import("@/lib/plan-grants/sendGrantNotification");

  return retryPlanGrantNotification({
    admin,
    actorId: input.actorId,
    targetUserId: input.targetUserId,
    grant: input.grant,
    eventType: input.eventType,
    eventVersion: input.eventVersion,
    previousPlan: input.previousPlan,
  });
}
