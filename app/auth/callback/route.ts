import { NextResponse } from "next/server";

import {
  INVITATION_TYPE_CREATE_ACCOUNT,
  INVITATION_TYPE_JOIN_HOUSEHOLD,
  isUuid,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED_NEXT_PATHS = new Set([
  "/invite/setup",
  "/onboarding/create-household",
  "/set-password",
  "/onboarding",
  "/dashboard",
]);

function isAllowedNextPath(path: string) {
  if (ALLOWED_NEXT_PATHS.has(path)) {
    return true;
  }

  return /^\/family\/accept\/[0-9a-f-]{36}$/i.test(path);
}

function resolveInviteNextPath(
  requestedNext: string | null,
  metadata: Record<string, unknown> | undefined
) {
  const invitationType = normalizeInvitationType(
    metadata?.invitation_type
  );

  if (invitationType === INVITATION_TYPE_CREATE_ACCOUNT) {
    return "/invite/setup";
  }

  if (invitationType === INVITATION_TYPE_JOIN_HOUSEHOLD) {
    const token = metadata?.invitation_token;

    if (typeof token === "string" && isUuid(token)) {
      return `/family/accept/${token}`;
    }

    if (
      requestedNext &&
      isAllowedNextPath(requestedNext)
    ) {
      return requestedNext;
    }

    return "/set-password";
  }

  if (
    requestedNext &&
    isAllowedNextPath(requestedNext)
  ) {
    return requestedNext;
  }

  if (
    metadata?.onboarding_mode === "create_household"
  ) {
    return "/invite/setup";
  }

  return "/invite/setup";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext =
    requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;

  if (!code) {
    console.error("[auth-callback] Missing authorization code.");

    return NextResponse.redirect(
      `${origin}/auth/error?reason=missing_auth_code`
    );
  }

  const supabase = await createClient();
  const { data, error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth-callback] Session exchange failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return NextResponse.redirect(
      `${origin}/auth/error?reason=auth_callback_failed`
    );
  }

  const metadata = data.session?.user
    .user_metadata as Record<string, unknown> | undefined;

  const safeNext = resolveInviteNextPath(
    requestedNext,
    metadata
  );

  console.info("Invite callback", {
    hasCode: Boolean(code),
    requestedNext,
    safeNext,
    invitationType: metadata?.invitation_type ?? null,
    onboardingMode: metadata?.onboarding_mode ?? null,
  });

  return NextResponse.redirect(`${origin}${safeNext}`);
}
