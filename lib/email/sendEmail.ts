import "server-only";

import {
  getEmailFromAddress,
  getEmailReplyToAddress,
  getResendClient,
} from "@/lib/email/resend";
import { renderEmail } from "@/lib/email/renderEmail";
import {
  type SendEmailInput,
  type SendEmailResult,
  type SendReactEmailInput,
  validateRecipients,
} from "@/lib/email/types";

function logSendAttempt(input: {
  subject: string;
  to: string[];
  tags?: SendEmailInput["tags"];
}) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[email] send attempt", input);
  }
}

function logSendFailure(error: unknown) {
  console.error("[email] send failed", error);
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const validation = validateRecipients(input.to);

  if (!validation.valid) {
    return {
      ok: false,
      code: "invalid_recipient",
      message: validation.message,
    };
  }

  const resend = getResendClient();

  if (!resend) {
    return {
      ok: false,
      code: "not_configured",
      message:
        "Email delivery is not configured on this environment.",
    };
  }

  logSendAttempt({
    subject: input.subject,
    to: validation.recipients,
    tags: input.tags,
  });

  try {
    const result = await resend.emails.send({
      from: getEmailFromAddress(),
      to: validation.recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo ?? getEmailReplyToAddress(),
      tags: input.tags,
    });

    if (result.error) {
      logSendFailure(result.error);

      return {
        ok: false,
        code: "provider_error",
        message:
          result.error.message ||
          "Unable to send email.",
      };
    }

    return {
      ok: true,
      id: result.data?.id ?? null,
    };
  } catch (error) {
    logSendFailure(error);

    return {
      ok: false,
      code: "unknown_error",
      message: "Unable to send email.",
    };
  }
}

export async function sendReactEmail(
  input: SendReactEmailInput
): Promise<SendEmailResult> {
  const { html, text } = await renderEmail(
    input.template
  );

  return sendEmail({
    to: input.to,
    subject: input.subject,
    html,
    text: input.text ?? text,
    replyTo: input.replyTo,
    tags: input.tags,
  });
}
