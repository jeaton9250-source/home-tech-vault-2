import "server-only";

import { createElement } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import ComplimentaryAccessChangedEmail, {
  complimentaryAccessChangedSubject,
  renderComplimentaryAccessChangedPlainText,
} from "@/emails/templates/ComplimentaryAccessChangedEmail";
import ComplimentaryAccessGrantedEmail, {
  complimentaryAccessGrantedSubject,
  renderComplimentaryAccessGrantedPlainText,
} from "@/emails/templates/ComplimentaryAccessGrantedEmail";
import ComplimentaryAccessRevokedEmail, {
  complimentaryAccessRevokedSubject,
  renderComplimentaryAccessRevokedPlainText,
} from "@/emails/templates/ComplimentaryAccessRevokedEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";
import { absoluteUrl } from "@/lib/marketing/site";
import type {
  ActivePlanGrant,
  AdminGrantPlan,
} from "@/lib/plan-grants/types";
import { isMissingEmailDeliveriesTableError } from "@/lib/plan-grants/grantErrors";
import {
  extractFirstName,
  formatGrantEmailDate,
  isCustomerVisibleGrantReason,
  planToDisplayName,
  type GrantNotificationResult,
  type PlanGrantEmailEventType,
} from "@/lib/plan-grants/notificationTypes";

type RecipientProfile = {
  userId: string;
  email: string | null;
  firstName: string;
};

type SendPlanGrantNotificationInput = {
  admin: SupabaseClient;
  actorId: string;
  targetUserId: string;
  grant: ActivePlanGrant;
  eventType: PlanGrantEmailEventType;
  previousPlan?: AdminGrantPlan | null;
  retryToken?: string | null;
};

function getEventVersion(
  grant: ActivePlanGrant,
  eventType: PlanGrantEmailEventType
) {
  if (eventType === "grant_revoked") {
    return (
      grant.revokedAt ||
      grant.createdAt
    );
  }

  return grant.createdAt;
}

function buildIdempotencyKey(options: {
  grantId: string;
  eventType: PlanGrantEmailEventType;
  eventVersion: string;
  retryToken?: string | null;
}) {
  const base = `${options.grantId}:${options.eventType}:${options.eventVersion}`;

  if (options.retryToken) {
    return `${base}:retry:${options.retryToken}`;
  }

  return base;
}

async function loadRecipientProfile(
  admin: SupabaseClient,
  userId: string
): Promise<RecipientProfile> {
  const [
    authResult,
    profileResult,
  ] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  return {
    userId,
    email:
      authResult.data.user?.email?.trim() ||
      null,
    firstName: extractFirstName(
      profileResult.data?.full_name
    ),
  };
}

async function findExistingDelivery(
  admin: SupabaseClient,
  idempotencyKey: string
) {
  const { data, error } = await admin
    .from("platform_email_deliveries")
    .select(
      "id, status, provider_message_id"
    )
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function insertPendingDelivery(
  admin: SupabaseClient,
  input: {
    eventType: PlanGrantEmailEventType;
    recipientUserId: string;
    recipientEmail: string;
    relatedGrantId: string;
    idempotencyKey: string;
    actorId: string;
  }
) {
  const { data, error } = await admin
    .from("platform_email_deliveries")
    .insert({
      event_type: input.eventType,
      recipient_user_id:
        input.recipientUserId,
      recipient_email:
        input.recipientEmail,
      related_grant_id:
        input.relatedGrantId,
      idempotency_key:
        input.idempotencyKey,
      status: "pending",
      created_by: input.actorId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

async function updateDeliveryStatus(
  admin: SupabaseClient,
  deliveryId: string,
  update: {
    status: "sent" | "failed" | "skipped";
    providerMessageId?: string | null;
    errorCode?: string | null;
  }
) {
  const { error } = await admin
    .from("platform_email_deliveries")
    .update({
      status: update.status,
      provider_message_id:
        update.providerMessageId ?? null,
      error_code: update.errorCode ?? null,
      delivered_at:
        update.status === "sent"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", deliveryId);

  if (error) {
    throw error;
  }
}

async function buildRevokedEmailContext(
  admin: SupabaseClient,
  targetUserId: string
) {
  const planAccess =
    await buildServerPlanAccessContext(
      admin,
      targetUserId
    );

  return {
    retainsPremiumAccess:
      planAccess.result
        .hasPremiumFeatureAccess,
  };
}

export async function sendPlanGrantNotification(
  input: SendPlanGrantNotificationInput
): Promise<GrantNotificationResult> {
  const eventVersion = getEventVersion(
    input.grant,
    input.eventType
  );

  const idempotencyKey =
    buildIdempotencyKey({
      grantId: input.grant.id,
      eventType: input.eventType,
      eventVersion,
      retryToken: input.retryToken,
    });

  const existingDelivery =
    await findExistingDelivery(
      input.admin,
      idempotencyKey
    );

  if (
    existingDelivery?.status === "sent"
  ) {
    return {
      status: "skipped",
      message:
        "Notification was already sent for this grant event.",
      deliveryId: existingDelivery.id,
      canRetry: false,
      eventType: input.eventType,
      eventVersion,
      providerMessageId:
        existingDelivery.provider_message_id,
    };
  }

  if (
    existingDelivery &&
    existingDelivery.status !== "failed" &&
    !input.retryToken
  ) {
    return {
      status: "skipped",
      message:
        "Notification is already in progress for this grant event.",
      deliveryId: existingDelivery.id,
      canRetry: false,
      eventType: input.eventType,
      eventVersion,
      providerMessageId: null,
    };
  }

  const recipient =
    await loadRecipientProfile(
      input.admin,
      input.targetUserId
    );

  if (!recipient.email) {
    return {
      status: "no_email",
      message:
        "No verified email address was available.",
      deliveryId: null,
      canRetry: false,
      eventType: input.eventType,
      eventVersion,
      providerMessageId: null,
    };
  }

  let deliveryId =
    existingDelivery?.status === "failed"
      ? existingDelivery.id
      : null;

  if (!deliveryId) {
    try {
      deliveryId =
        await insertPendingDelivery(
          input.admin,
          {
            eventType: input.eventType,
            recipientUserId:
              input.targetUserId,
            recipientEmail:
              recipient.email,
            relatedGrantId:
              input.grant.id,
            idempotencyKey,
            actorId: input.actorId,
          }
        );
    } catch (insertError) {
      if (
        isMissingEmailDeliveriesTableError(
          insertError
        )
      ) {
        console.warn(
          "platform_email_deliveries unavailable; sending without delivery log."
        );
        deliveryId = null;
      } else {
        const duplicateDelivery =
          await findExistingDelivery(
            input.admin,
            idempotencyKey
          );

        if (
          duplicateDelivery?.status ===
          "sent"
        ) {
          return {
            status: "skipped",
            message:
              "Notification was already sent for this grant event.",
            deliveryId:
              duplicateDelivery.id,
            canRetry: false,
            eventType: input.eventType,
            eventVersion,
            providerMessageId:
              duplicateDelivery.provider_message_id,
          };
        }

        throw insertError;
      }
    }
  }

  const dashboardUrl = absoluteUrl(
    "/dashboard"
  );
  const accountUrl = absoluteUrl("/account");
  const planLabel = planToDisplayName(
    input.grant.plan
  );
  const startsAtLabel =
    formatGrantEmailDate(
      input.grant.startsAt
    ) || "Today";
  const expiresAtLabel =
    formatGrantEmailDate(
      input.grant.expiresAt
    );
  const publicReason =
    isCustomerVisibleGrantReason(
      input.grant.reason
    )
      ? input.grant.reason
      : null;

  let sendResult;

  if (input.eventType === "grant_created") {
    sendResult = await sendReactEmail({
      to: recipient.email,
      subject:
        complimentaryAccessGrantedSubject(
          planLabel
        ),
      template: createElement(
        ComplimentaryAccessGrantedEmail,
        {
          firstName: recipient.firstName,
          planLabel,
          dashboardUrl,
          startsAtLabel,
          expiresAtLabel,
          publicReason,
        }
      ),
      text: renderComplimentaryAccessGrantedPlainText(
        {
          firstName: recipient.firstName,
          planLabel,
          dashboardUrl,
          startsAtLabel,
          expiresAtLabel,
          publicReason,
        }
      ),
      tags: [
        {
          name: "category",
          value: "plan_grant",
        },
        {
          name: "event",
          value: input.eventType,
        },
      ],
    });
  } else if (
    input.eventType === "grant_replaced"
  ) {
    const previousPlanLabel =
      planToDisplayName(
        input.previousPlan ||
          input.grant.plan
      );

    sendResult = await sendReactEmail({
      to: recipient.email,
      subject:
        complimentaryAccessChangedSubject,
      template: createElement(
        ComplimentaryAccessChangedEmail,
        {
          firstName: recipient.firstName,
          previousPlanLabel,
          newPlanLabel: planLabel,
          accountUrl,
          expiresAtLabel,
        }
      ),
      text: renderComplimentaryAccessChangedPlainText(
        {
          firstName: recipient.firstName,
          previousPlanLabel,
          newPlanLabel: planLabel,
          accountUrl,
          expiresAtLabel,
        }
      ),
      tags: [
        {
          name: "category",
          value: "plan_grant",
        },
        {
          name: "event",
          value: input.eventType,
        },
      ],
    });
  } else if (
    input.eventType === "grant_revoked"
  ) {
    const revokedContext =
      await buildRevokedEmailContext(
        input.admin,
        input.targetUserId
      );

    const effectiveEndLabel =
      formatGrantEmailDate(
        input.grant.revokedAt
      ) || "Today";

    sendResult = await sendReactEmail({
      to: recipient.email,
      subject:
        complimentaryAccessRevokedSubject,
      template: createElement(
        ComplimentaryAccessRevokedEmail,
        {
          firstName: recipient.firstName,
          planLabel,
          accountUrl,
          effectiveEndLabel,
          retainsPremiumAccess:
            revokedContext.retainsPremiumAccess,
        }
      ),
      text: renderComplimentaryAccessRevokedPlainText(
        {
          firstName: recipient.firstName,
          planLabel,
          accountUrl,
          effectiveEndLabel,
          retainsPremiumAccess:
            revokedContext.retainsPremiumAccess,
        }
      ),
      tags: [
        {
          name: "category",
          value: "plan_grant",
        },
        {
          name: "event",
          value: input.eventType,
        },
      ],
    });
  } else {
    await updateDeliveryStatus(
      input.admin,
      deliveryId,
      {
        status: "skipped",
        errorCode: "deferred_event",
      }
    );

    return {
      status: "skipped",
      message:
        "This notification event is not wired yet.",
      deliveryId,
      canRetry: false,
      eventType: input.eventType,
      eventVersion,
      providerMessageId: null,
    };
  }

  if (!sendResult.ok) {
    if (deliveryId) {
      await updateDeliveryStatus(
        input.admin,
        deliveryId,
        {
          status: "failed",
          errorCode: sendResult.code,
        }
      );
    }

    console.error(
      "[plan-grant-email] send failed",
      {
        grantId: input.grant.id,
        eventType: input.eventType,
        code: sendResult.code,
        message: sendResult.message,
      }
    );

    return {
      status: "failed",
      message:
        "Access was updated, but the notification email could not be delivered.",
      deliveryId,
      canRetry: true,
      eventType: input.eventType,
      eventVersion,
      providerMessageId: null,
    };
  }

  if (deliveryId) {
    await updateDeliveryStatus(
      input.admin,
      deliveryId,
      {
        status: "sent",
        providerMessageId: sendResult.id,
      }
    );
  }

  return {
    status: "sent",
    message: "Notification sent.",
    deliveryId,
    canRetry: false,
    eventType: input.eventType,
    eventVersion,
    providerMessageId: sendResult.id,
    previousPlan: input.previousPlan ?? null,
  };
}

export async function retryPlanGrantNotification(options: {
  admin: SupabaseClient;
  actorId: string;
  targetUserId: string;
  grant: ActivePlanGrant;
  eventType: PlanGrantEmailEventType;
  eventVersion: string;
  previousPlan?: AdminGrantPlan | null;
}) {
  const retryToken = crypto.randomUUID();

  return sendPlanGrantNotification({
    admin: options.admin,
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    grant: options.grant,
    eventType: options.eventType,
    previousPlan: options.previousPlan,
    retryToken,
  });
}
