import type { ReactElement } from "react";

export type EmailRecipient = string | string[];

export type EmailTag = {
  name: string;
  value: string;
};

export type SendEmailInput = {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: EmailTag[];
};

export type SendEmailSuccess = {
  ok: true;
  id: string | null;
};

export type SendEmailFailure = {
  ok: false;
  code:
    | "not_configured"
    | "invalid_recipient"
    | "provider_error"
    | "unknown_error";
  message: string;
};

export type SendEmailResult =
  | SendEmailSuccess
  | SendEmailFailure;

export type SendReactEmailInput = {
  to: EmailRecipient;
  subject: string;
  template: ReactElement;
  text?: string;
  replyTo?: string;
  tags?: EmailTag[];
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeRecipients(
  to: EmailRecipient
): string[] {
  const recipients = Array.isArray(to) ? to : [to];

  return recipients
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isValidEmailAddress(
  email: string
) {
  return (
    email.length >= 5 &&
    email.length <= 254 &&
    EMAIL_PATTERN.test(email)
  );
}

export function validateRecipients(
  to: EmailRecipient
) {
  const recipients = normalizeRecipients(to);

  if (recipients.length === 0) {
    return {
      valid: false as const,
      message: "A recipient email is required.",
    };
  }

  if (
    recipients.some(
      (email) => !isValidEmailAddress(email)
    )
  ) {
    return {
      valid: false as const,
      message: "One or more recipient emails are invalid.",
    };
  }

  return {
    valid: true as const,
    recipients,
  };
}
