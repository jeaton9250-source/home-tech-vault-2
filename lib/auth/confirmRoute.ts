import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_NEXT_PATHS = new Set([
  "/invite/setup",
  "/onboarding/create-household",
  "/set-password",
  "/onboarding",
  "/dashboard",
]);

export const ALLOWED_OTP_TYPES =
  new Set<EmailOtpType>([
    "invite",
    "signup",
    "recovery",
    "email",
    "email_change",
  ]);

export function isAllowedConfirmNextPath(
  path: string
) {
  if (ALLOWED_NEXT_PATHS.has(path)) {
    return true;
  }

  return /^\/family\/accept\/[0-9a-f-]{36}$/i.test(
    path
  );
}

export function resolveConfirmNextPath(
  requestedNext: string | null,
  otpType: EmailOtpType
) {
  if (
    requestedNext &&
    isAllowedConfirmNextPath(requestedNext)
  ) {
    return requestedNext;
  }

  if (otpType === "invite" || otpType === "signup") {
    return "/invite/setup";
  }

  if (otpType === "recovery") {
    return "/reset-password";
  }

  return "/dashboard";
}

export function authConfirmErrorPath(
  message: string
) {
  return `/auth/error?message=${encodeURIComponent(message)}`;
}
