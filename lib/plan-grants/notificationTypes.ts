import type {
  AdminGrantPlan,
  PlanGrantReason,
} from "@/lib/plan-grants/types";

export type PlanGrantEmailEventType =
  | "grant_created"
  | "grant_replaced"
  | "grant_revoked"
  | "grant_expiring_soon"
  | "grant_expired";

export type GrantNotificationStatus =
  | "sent"
  | "failed"
  | "skipped"
  | "no_email";

export type GrantNotificationResult = {
  status: GrantNotificationStatus;
  message: string;
  deliveryId: string | null;
  canRetry: boolean;
  eventType: PlanGrantEmailEventType;
  eventVersion: string;
  providerMessageId: string | null;
  previousPlan?: AdminGrantPlan | null;
};

export const CUSTOMER_VISIBLE_GRANT_REASONS: PlanGrantReason[] =
  [
    "Founding Member",
    "Beta Tester",
    "Employee",
    "Friend or Family",
    "Promotion",
    "Contest Winner",
    "Customer Service Credit",
    "Influencer or Partner",
  ];

export function planToDisplayName(
  plan: AdminGrantPlan
): "Pro" | "Family" {
  return plan === "family" ? "Family" : "Pro";
}

export function formatGrantEmailDate(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function extractFirstName(
  fullName: string | null | undefined
) {
  const trimmed = fullName?.trim();

  if (!trimmed) {
    return "there";
  }

  return trimmed.split(/\s+/)[0] || "there";
}

export function isCustomerVisibleGrantReason(
  reason: string | null | undefined
): reason is PlanGrantReason {
  if (!reason) {
    return false;
  }

  return CUSTOMER_VISIBLE_GRANT_REASONS.includes(
    reason as PlanGrantReason
  );
}

export function buildGrantNotificationAdminMessage(options: {
  plan: AdminGrantPlan;
  action: "granted" | "revoked";
  notification: GrantNotificationResult;
}) {
  const planName = planToDisplayName(
    options.plan
  );

  if (options.action === "revoked") {
    if (
      options.notification.status === "sent"
    ) {
      return `${planName} access revoked and notification sent.`;
    }

    if (
      options.notification.status === "no_email"
    ) {
      return `${planName} access revoked. No verified email address was available.`;
    }

    if (
      options.notification.status === "failed"
    ) {
      return `${planName} access revoked, but the notification email failed.`;
    }

    return `${planName} access revoked. ${options.notification.message}`;
  }

  if (options.notification.status === "sent") {
    return `${planName} access granted and notification sent.`;
  }

  if (
    options.notification.status === "no_email"
  ) {
    return `${planName} access granted. No verified email address was available.`;
  }

  if (
    options.notification.status === "failed"
  ) {
    return `${planName} access granted, but the notification email failed.`;
  }

  return `${planName} access granted. ${options.notification.message}`;
}
