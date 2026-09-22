import "server-only";

import MilestoneEmail, {
  getMilestoneSubject,
  renderMilestonePlainText,
  type MilestoneEmailType,
} from "@/emails/templates/MilestoneEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { getSiteUrl } from "@/lib/marketing/site";
import { createAdminClient } from "@/lib/supabase/admin";

export type AutomaticOnboardingMilestone =
  | "first_device"
  | "core_setup"
  | "activated";

const PENDING_RETRY_MS =
  15 * 60 * 1000;

function getFirstName(
  metadata: Record<string, unknown> | undefined
) {
  const candidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.first_name,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return (
        candidate
          .trim()
          .split(/\s+/)[0] || undefined
      );
    }
  }

  return undefined;
}

async function onboardingEmailsEnabled(
  userId: string
) {
  const admin = createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("lifecycle_email_preferences")
    .select("onboarding_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.onboarding_enabled ??
    true
  );
}

export async function sendOnboardingMilestoneEmail(
  userId: string,
  type: AutomaticOnboardingMilestone
) {
  try {
    const admin =
      createAdminClient();

    const {
      data: userData,
      error: userError,
    } =
      await admin.auth.admin.getUserById(
        userId
      );

    const user =
      userData?.user;

    if (
      userError ||
      !user ||
      !user.email
    ) {
      return {
        ok: false as const,
        sent: false,
        error: "User or email not found.",
      };
    }

    const enabled =
      await onboardingEmailsEnabled(
        userId
      );

    if (!enabled) {
      return {
        ok: true as const,
        sent: false,
        skipped: "unsubscribed" as const,
      };
    }

    const emailType =
      `milestone_${type}`;

    const idempotencyKey =
      `${userId}:${emailType}`;

    const {
      data: existing,
      error: existingError,
    } = await admin
      .from("lifecycle_email_log")
      .select(
        "id, status, attempted_at"
      )
      .eq(
        "idempotency_key",
        idempotencyKey
      )
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (
      existing?.status === "sent"
    ) {
      return {
        ok: true as const,
        sent: false,
        skipped: "already_sent" as const,
      };
    }

    if (
      existing?.status === "pending"
    ) {
      const attemptedAt =
        Date.parse(
          existing.attempted_at ?? ""
        );

      if (
        Number.isFinite(attemptedAt) &&
        Date.now() - attemptedAt <
          PENDING_RETRY_MS
      ) {
        return {
          ok: true as const,
          sent: false,
          skipped: "pending" as const,
        };
      }
    }

    const now =
      new Date().toISOString();

    let logId:
      string | null =
      existing?.id ?? null;

    if (logId) {
      const {
        error: retryError,
      } = await admin
        .from("lifecycle_email_log")
        .update({
          status: "pending",
          attempted_at: now,
          updated_at: now,
          error_message: null,
          provider_message_id: null,
        })
        .eq("id", logId);

      if (retryError) {
        throw retryError;
      }
    } else {
      const {
        data: createdLog,
        error: createError,
      } = await admin
        .from("lifecycle_email_log")
        .insert({
          user_id: userId,
          recipient_email:
            user.email,
          email_type: emailType,
          status: "pending",
          provider: "resend",
          idempotency_key:
            idempotencyKey,
          attempted_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (createError) {
        if (
          createError.code === "23505"
        ) {
          return {
            ok: true as const,
            sent: false,
            skipped:
              "already_claimed" as const,
          };
        }

        throw createError;
      }

      logId =
        createdLog.id;
    }

    const dashboardUrl =
      `${getSiteUrl()}/dashboard`;

    const firstName =
      getFirstName(
        user.user_metadata
      );

    const templateType:
      MilestoneEmailType =
      type;

    const result =
      await sendReactEmail({
        to: user.email,
        subject:
          getMilestoneSubject(
            templateType
          ),
        template:
          MilestoneEmail({
            type: templateType,
            firstName,
            dashboardUrl,
          }),
        text:
          renderMilestonePlainText({
            type: templateType,
            firstName,
            dashboardUrl,
          }),
      });

    if (!result.ok) {
      await admin
        .from("lifecycle_email_log")
        .update({
          status: "failed",
          error_message:
            result.message,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", logId);

      return {
        ok: false as const,
        sent: false,
        error: result.message,
      };
    }

    const sentAt =
      new Date().toISOString();

    const {
      error: sentError,
    } = await admin
      .from("lifecycle_email_log")
      .update({
        status: "sent",
        provider_message_id:
          result.id,
        sent_at: sentAt,
        updated_at: sentAt,
        error_message: null,
      })
      .eq("id", logId);

    if (sentError) {
      console.error(
        "[onboarding-milestone-email] sent but unable to update delivery log",
        {
          userId,
          type,
          error: sentError,
        }
      );
    }

    return {
      ok: true as const,
      sent: true,
      providerMessageId:
        result.id,
    };
  } catch (error) {
    console.error(
      "[onboarding-milestone-email] failed",
      {
        userId,
        type,
        error,
      }
    );

    return {
      ok: false as const,
      sent: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown milestone email error.",
    };
  }
}
