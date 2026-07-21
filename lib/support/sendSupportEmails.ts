import "server-only";

import SupportRequestReceivedEmail, {
  renderSupportRequestReceivedPlainText,
  supportRequestReceivedSubject,
} from "@/emails/templates/SupportRequestReceivedEmail";
import {
  getEmailReplyToAddress,
  getSupportEmailTo,
} from "@/lib/email/resend";
import { sendEmail, sendReactEmail } from "@/lib/email/sendEmail";
import { emailTheme } from "@/emails/styles/emailTheme";

type SupportEmailPayload = {
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  message: string;
  isSignedIn: boolean;
  effectivePlan: string | null;
  householdRole: string | null;
  sourcePage: string | null;
  submittedAt: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildInternalSupportEmailHtml(
  payload: SupportEmailPayload
) {
  const adminUrl = `${emailTheme.brand.siteUrl}/admin/support/${payload.ticketId}`;
  const submittedAt = new Date(
    payload.submittedAt
  ).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const contextRows = [
    [
      "Signed in",
      payload.isSignedIn ? "Yes" : "No",
    ],
    [
      "Effective plan",
      payload.effectivePlan || "Unknown",
    ],
    [
      "Household role",
      payload.householdRole || "Not available",
    ],
    [
      "Source page",
      payload.sourcePage || "Not provided",
    ],
  ];

  const contextHtml = contextRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#78716C;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;">${escapeHtml(label)}</td></tr><tr><td style="padding:0 0 16px;color:#1C1917;font-size:14px;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#FAF9F7;font-family:Arial,Helvetica,sans-serif;color:#1C1917;">
    <div style="max-width:640px;margin:0 auto;background:#FDFCFA;border:1px solid #E7E2DA;border-radius:16px;padding:32px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#78716C;">Home Tech Vault Support</p>
      <h1 style="margin:0 0 16px;font-size:24px;">${escapeHtml(payload.ticketNumber)}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#44403C;">
        <strong>${escapeHtml(payload.category)}:</strong> ${escapeHtml(payload.subject)}
      </p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 0;color:#78716C;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;">Customer</td></tr>
        <tr><td style="padding:0 0 16px;color:#1C1917;font-size:14px;">${escapeHtml(payload.customerName)} &lt;${escapeHtml(payload.customerEmail)}&gt;</td></tr>
        ${contextHtml}
        <tr><td style="padding:8px 0;color:#78716C;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;">Submitted</td></tr>
        <tr><td style="padding:0 0 16px;color:#1C1917;font-size:14px;">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <div style="padding:20px;border-radius:16px;background:#FAF9F7;border:1px solid #E7E2DA;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#78716C;">Message</p>
        <p style="margin:0;white-space:pre-wrap;font-size:15px;line-height:1.7;color:#44403C;">${escapeHtml(payload.message)}</p>
      </div>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#44403C;">
        <a href="${adminUrl}" style="color:#1C1917;font-weight:600;">Open in Admin Support Inbox</a>
      </p>
    </div>
  </body>
</html>`;
}

function buildInternalSupportEmailText(
  payload: SupportEmailPayload
) {
  const adminUrl = `${emailTheme.brand.siteUrl}/admin/support/${payload.ticketId}`;

  return `[HTV Support] ${payload.ticketNumber}

Category: ${payload.category}
Subject: ${payload.subject}
Customer: ${payload.customerName} <${payload.customerEmail}>
Signed in: ${payload.isSignedIn ? "Yes" : "No"}
Effective plan: ${payload.effectivePlan || "Unknown"}
Household role: ${payload.householdRole || "Not available"}
Source page: ${payload.sourcePage || "Not provided"}
Submitted: ${payload.submittedAt}

Message:
${payload.message}

Admin inbox:
${adminUrl}`;
}

export async function sendSupportTicketEmails(
  payload: SupportEmailPayload
) {
  const warnings: string[] = [];
  const supportDestination = getSupportEmailTo();
  let internalSent = false;

  if (!supportDestination) {
    warnings.push(
      "Support notification email is not configured."
    );
  } else {
    const internalResult = await sendEmail({
      to: supportDestination,
      subject: `[HTV Support] ${payload.ticketNumber} — ${payload.category}: ${payload.subject}`,
      html: buildInternalSupportEmailHtml(payload),
      text: buildInternalSupportEmailText(payload),
      replyTo: payload.customerEmail,
      tags: [
        {
          name: "category",
          value: "support_notification",
        },
        {
          name: "ticket_number",
          value: payload.ticketNumber,
        },
      ],
    });

    internalSent = internalResult.ok;

    if (!internalResult.ok) {
      warnings.push(
        internalResult.message ||
          "Support notification email failed."
      );
    }
  }

  const firstName =
    payload.customerName.trim().split(" ")[0] ||
    undefined;

  const confirmationResult = await sendReactEmail({
    to: payload.customerEmail,
    subject: supportRequestReceivedSubject,
    template: SupportRequestReceivedEmail({
      firstName,
      customerEmail: payload.customerEmail,
      ticketNumber: payload.ticketNumber,
      subject: payload.subject,
      category: payload.category,
      contactUrl: `${emailTheme.brand.siteUrl}/contact`,
    }),
    text: renderSupportRequestReceivedPlainText({
      firstName,
      customerEmail: payload.customerEmail,
      ticketNumber: payload.ticketNumber,
      subject: payload.subject,
      category: payload.category,
      contactUrl: `${emailTheme.brand.siteUrl}/contact`,
    }),
    replyTo: getEmailReplyToAddress(),
    tags: [
      {
        name: "category",
        value: "support_confirmation",
      },
      {
        name: "ticket_number",
        value: payload.ticketNumber,
      },
    ],
  });

  if (!confirmationResult.ok) {
    warnings.push(
      confirmationResult.message ||
        "Customer confirmation email failed."
    );
  }

  return {
    warnings,
    deliveryStatus: {
      internal: !supportDestination
        ? "not_configured"
        : internalSent
          ? "sent"
          : "failed",
      confirmation: confirmationResult.ok
        ? "sent"
        : "failed",
    },
  };
}
