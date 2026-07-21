import "server-only";

import { Resend } from "resend";

const DEFAULT_FROM =
  "Home Tech Vault <hello@hometechvault.com>";

const DEFAULT_REPLY_TO =
  "support@hometechvault.com";

let resendClient: Resend | null = null;

export function getEmailFromAddress() {
  return (
    process.env.EMAIL_FROM?.trim() || DEFAULT_FROM
  );
}

export function getEmailReplyToAddress() {
  return (
    process.env.EMAIL_REPLY_TO?.trim() ||
    DEFAULT_REPLY_TO
  );
}

export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function isResendConfigured() {
  return Boolean(getResendApiKey());
}

export function getResendClient() {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
