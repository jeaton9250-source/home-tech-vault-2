import "server-only";

import { createElement } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import FoundingMemberWelcomeEmail, {
  foundingMemberWelcomeSubject,
  renderFoundingMemberWelcomePlainText,
} from "@/emails/templates/FoundingMemberWelcomeEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { absoluteUrl } from "@/lib/marketing/site";
import { isMissingEmailDeliveriesTableError } from "@/lib/plan-grants/grantErrors";
import { extractFirstName } from "@/lib/plan-grants/notificationTypes";

type EnrollmentEmailResult = {
  status: "sent" | "failed" | "skipped" | "no_email";
  message: string;
  deliveryId: string | null;
};

async function loadRecipientProfile(
  admin: SupabaseClient,
  userId: string
) {
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
    email:
      authResult.data.user?.email?.trim() ||
      null,
    firstName: extractFirstName(
      profileResult.data?.full_name
    ),
  };
}

export async function sendFoundingMemberEnrollmentEmail(options: {
  admin: SupabaseClient;
  actorId: string;
  targetUserId: string;
  memberNumber: number;
  grantId: string | null;
  grantCreated: boolean;
}): Promise<EnrollmentEmailResult> {
  const recipient =
    await loadRecipientProfile(
      options.admin,
      options.targetUserId
    );

  if (!recipient.email) {
    return {
      status: "no_email",
      message:
        "No verified email address was available.",
      deliveryId: null,
    };
  }

  const idempotencyKey = `founding-member:${options.targetUserId}:${options.memberNumber}`;
  const dashboardUrl = absoluteUrl("/dashboard");
  const contactUrl = absoluteUrl("/contact");

  let deliveryId: string | null = null;

  try {
    const { data: existingDelivery } =
      await options.admin
        .from("platform_email_deliveries")
        .select("id, status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

    if (existingDelivery?.status === "sent") {
      return {
        status: "skipped",
        message:
          "Welcome email was already sent for this enrollment.",
        deliveryId: existingDelivery.id,
      };
    }

    deliveryId = existingDelivery?.id ?? null;

    if (!deliveryId) {
      const { data: inserted, error } =
        await options.admin
          .from("platform_email_deliveries")
          .insert({
            event_type:
              "founding_member_enrolled",
            recipient_user_id:
              options.targetUserId,
            recipient_email:
              recipient.email,
            related_grant_id:
              options.grantId,
            idempotency_key:
              idempotencyKey,
            status: "pending",
            created_by: options.actorId,
          })
          .select("id")
          .single();

      if (error) {
        throw error;
      }

      deliveryId = inserted.id;
    }
  } catch (insertError) {
    if (
      !isMissingEmailDeliveriesTableError(
        insertError
      )
    ) {
      throw insertError;
    }
  }

  const sendResult = await sendReactEmail({
    to: recipient.email,
    subject: foundingMemberWelcomeSubject,
    template: createElement(
      FoundingMemberWelcomeEmail,
      {
        firstName: recipient.firstName,
        memberNumber: options.memberNumber,
        dashboardUrl,
        contactUrl,
        includesComplimentaryPro:
          options.grantCreated ||
          Boolean(options.grantId),
      }
    ),
    text: renderFoundingMemberWelcomePlainText({
      firstName: recipient.firstName,
      memberNumber: options.memberNumber,
      dashboardUrl,
      contactUrl,
      includesComplimentaryPro:
        options.grantCreated ||
        Boolean(options.grantId),
    }),
    tags: [
      {
        name: "category",
        value: "founding_member",
      },
      {
        name: "member_number",
        value: String(options.memberNumber),
      },
    ],
  });

  if (deliveryId) {
    await options.admin
      .from("platform_email_deliveries")
      .update({
        status: sendResult.ok ? "sent" : "failed",
        provider_message_id: sendResult.ok
          ? sendResult.id
          : null,
        error_code: sendResult.ok
          ? null
          : sendResult.code,
        delivered_at: sendResult.ok
          ? new Date().toISOString()
          : null,
      })
      .eq("id", deliveryId);
  }

  if (!sendResult.ok) {
    return {
      status: "failed",
      message:
        "Enrollment saved, but the welcome email could not be delivered.",
      deliveryId,
    };
  }

  return {
    status: "sent",
    message: "Welcome email sent.",
    deliveryId,
  };
}
