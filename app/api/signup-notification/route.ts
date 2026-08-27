import { NextResponse } from "next/server";

import {
  getEmailFromAddress,
  getResendClient,
} from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SIGNUP_NOTIFICATION_TO = "jeaton9250@gmail.com";
const MAX_NEW_ACCOUNT_AGE_MS = 15 * 60 * 1000;

type SignupNotificationBody = {
  userId?: unknown;
  email?: unknown;
  method?: unknown;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupNotificationBody;

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const submittedEmail =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const method =
      typeof body.method === "string"
        ? body.method.trim()
        : "email";

    if (!userId || !submittedEmail) {
      return NextResponse.json(
        { error: "Missing signup information." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await admin.auth.admin.getUserById(userId);

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: "Signup could not be verified." },
        { status: 404 }
      );
    }

    const verifiedEmail = user.email.trim().toLowerCase();

    if (verifiedEmail !== submittedEmail) {
      return NextResponse.json(
        { error: "Signup information did not match." },
        { status: 403 }
      );
    }

    const createdAtMs = new Date(user.created_at).getTime();
    const accountAgeMs = Date.now() - createdAtMs;

    if (
      !Number.isFinite(createdAtMs) ||
      accountAgeMs < 0 ||
      accountAgeMs > MAX_NEW_ACCOUNT_AGE_MS
    ) {
      return NextResponse.json(
        { error: "Signup notification window expired." },
        { status: 409 }
      );
    }

    const alreadyNotified =
      typeof user.app_metadata?.signup_notification_sent_at ===
      "string";

    if (alreadyNotified) {
      return NextResponse.json({
        ok: true,
        alreadyNotified: true,
      });
    }

    const resend = getResendClient();

    if (!resend) {
      console.error(
        "Signup notification skipped: Resend is not configured."
      );

      return NextResponse.json(
        { error: "Email delivery is unavailable." },
        { status: 503 }
      );
    }

    const signupTime = new Date(user.created_at);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/New_York",
    }).format(signupTime);

    const safeEmail = escapeHtml(verifiedEmail);
    const safeMethod = escapeHtml(method);
    const safeUserId = escapeHtml(user.id);

    const { error: emailError } = await resend.emails.send({
      from: getEmailFromAddress(),
      to: SIGNUP_NOTIFICATION_TO,
      subject: "🎉 New Home Tech Vault Signup",
      text: [
        "A new user just created a Home Tech Vault account.",
        "",
        `Email: ${verifiedEmail}`,
        `Signup method: ${method}`,
        `Signed up: ${formattedTime}`,
        `User ID: ${user.id}`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:32px;color:#17212a;">
          <div style="background:#17212a;border-radius:18px;padding:24px 28px;color:white;">
            <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.7;">
              Home Tech Vault
            </div>
            <h1 style="margin:10px 0 0;font-size:26px;">
              🎉 New signup
            </h1>
          </div>

          <div style="padding:28px 6px;">
            <p style="font-size:16px;line-height:1.6;margin-top:0;">
              A new user just created a Home Tech Vault account.
            </p>

            <div style="background:#f5f1e8;border-radius:16px;padding:22px;margin-top:22px;">
              <p style="margin:0 0 12px;">
                <strong>Email:</strong><br />
                ${safeEmail}
              </p>

              <p style="margin:0 0 12px;">
                <strong>Signup method:</strong><br />
                ${safeMethod}
              </p>

              <p style="margin:0 0 12px;">
                <strong>Signed up:</strong><br />
                ${escapeHtml(formattedTime)}
              </p>

              <p style="margin:0;">
                <strong>User ID:</strong><br />
                <span style="font-size:13px;">${safeUserId}</span>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error(
        "Unable to send signup notification:",
        emailError
      );

      return NextResponse.json(
        { error: "Unable to send signup notification." },
        { status: 502 }
      );
    }

    const existingAppMetadata =
      user.app_metadata &&
      typeof user.app_metadata === "object"
        ? user.app_metadata
        : {};

    const { error: metadataError } =
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...existingAppMetadata,
          signup_notification_sent_at:
            new Date().toISOString(),
        },
      });

    if (metadataError) {
      console.error(
        "Signup notification sent, but notification state could not be saved:",
        metadataError
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Signup notification route error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to process signup notification." },
      { status: 500 }
    );
  }
}
