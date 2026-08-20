"use server";

import WelcomeEmail, {
  renderWelcomePlainText,
  welcomeSubject,
} from "@/emails/templates/WelcomeEmail";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { getSiteUrl } from "@/lib/marketing/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const WELCOME_EMAIL_TYPE = "welcome";
const MAX_ACCOUNT_AGE_MS =
  24 * 60 * 60 * 1000;
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

export async function sendWelcomeEmailForCurrentUser() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user ||
    !user.email
  ) {
    return {
      ok: false as const,
      sent: false,
    };
  }

  const createdAt =
    Date.parse(user.created_at);

  if (
    Number.isFinite(createdAt) &&
    Date.now() - createdAt >
      MAX_ACCOUNT_AGE_MS
  ) {
    return {
      ok: true as const,
      sent: false,
    };
  }

  const admin =
    createAdminClient();

  const idempotencyKey =
    `${user.id}:${WELCOME_EMAIL_TYPE}`;

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
    console.error(
      "[welcome-email] unable to read delivery state",
      existingError
    );

    return {
      ok: false as const,
      sent: false,
    };
  }

  if (
    existing?.status === "sent"
  ) {
    return {
      ok: true as const,
      sent: false,
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
      console.error(
        "[welcome-email] unable to prepare retry",
        retryError
      );

      return {
        ok: false as const,
        sent: false,
      };
    }
  } else {
    const {
      data: createdLog,
      error: createError,
    } = await admin
      .from("lifecycle_email_log")
      .insert({
        user_id: user.id,
        recipient_email:
          user.email,
        email_type:
          WELCOME_EMAIL_TYPE,
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
        createError.code ===
        "23505"
      ) {
        return {
          ok: true as const,
          sent: false,
        };
      }

      console.error(
        "[welcome-email] unable to create delivery record",
        createError
      );

      return {
        ok: false as const,
        sent: false,
      };
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

  const result =
    await sendReactEmail({
      to: user.email,
      subject: welcomeSubject,
      template: WelcomeEmail({
        firstName,
        dashboardUrl,
      }),
      text:
        renderWelcomePlainText({
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

    console.error(
      "[welcome-email] delivery failed",
      {
        userId: user.id,
        code: result.code,
      }
    );

    return {
      ok: false as const,
      sent: false,
    };
  }

  const sentAt =
    new Date().toISOString();

  await admin
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

  return {
    ok: true as const,
    sent: true,
  };
}
