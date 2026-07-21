import { isSupportCategory } from "@/lib/support/categories";
import { SUPPORT_FIELD_LIMITS } from "@/lib/support/constants";
import { isValidEmailAddress } from "@/lib/email/types";

export type SupportTicketInput = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  sourcePage?: string | null;
  honeypot?: string | null;
  idempotencyKey?: string | null;
  isDemo?: boolean;
};

export type ValidatedSupportTicketInput = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  sourcePage: string | null;
  idempotencyKey: string | null;
  honeypot: string | null;
  isDemo: boolean;
};

const HTML_TAG_PATTERN = /<[^>]*>/g;

export function stripHtml(value: string) {
  return value
    .replace(HTML_TAG_PATTERN, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

export function normalizeSupportInput(
  input: SupportTicketInput
): ValidatedSupportTicketInput {
  return {
    name: stripHtml(input.name.trim()),
    email: input.email.trim().toLowerCase(),
    subject: stripHtml(input.subject.trim()),
    category: input.category.trim(),
    message: stripHtml(input.message.trim()),
    sourcePage: input.sourcePage
      ? stripHtml(input.sourcePage.trim()).slice(
          0,
          SUPPORT_FIELD_LIMITS.sourcePageMax
        )
      : null,
    idempotencyKey: input.idempotencyKey?.trim() || null,
    honeypot: input.honeypot?.trim() || null,
    isDemo: input.isDemo === true,
  };
}

export function validateSupportTicketInput(
  input: ValidatedSupportTicketInput
):
  | { valid: true }
  | { valid: false; message: string } {
  if (input.honeypot && input.honeypot.length > 0) {
    return {
      valid: false,
      message: "Unable to submit this request.",
    };
  }

  if (
    input.name.length <
      SUPPORT_FIELD_LIMITS.nameMin ||
    input.name.length > SUPPORT_FIELD_LIMITS.nameMax
  ) {
    return {
      valid: false,
      message: "Please enter your name.",
    };
  }

  if (!isValidEmailAddress(input.email)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  if (!isSupportCategory(input.category)) {
    return {
      valid: false,
      message: "Please choose a valid category.",
    };
  }

  if (
    input.subject.length <
      SUPPORT_FIELD_LIMITS.subjectMin ||
    input.subject.length >
      SUPPORT_FIELD_LIMITS.subjectMax
  ) {
    return {
      valid: false,
      message: "Please enter a subject between 3 and 200 characters.",
    };
  }

  if (
    input.message.length <
      SUPPORT_FIELD_LIMITS.messageMin ||
    input.message.length >
      SUPPORT_FIELD_LIMITS.messageMax
  ) {
    return {
      valid: false,
      message:
        "Please enter a message between 10 and 5,000 characters.",
    };
  }

  if (
    input.idempotencyKey &&
    !/^[a-zA-Z0-9:_-]{8,128}$/.test(
      input.idempotencyKey
    )
  ) {
    return {
      valid: false,
      message: "This request could not be processed.",
    };
  }

  return { valid: true };
}
