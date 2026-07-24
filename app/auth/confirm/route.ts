import {
  type EmailOtpType,
} from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  ALLOWED_OTP_TYPES,
  authConfirmErrorPath,
  resolveConfirmNextPath,
} from "@/lib/auth/confirmRoute";
import { resolveInviteNextPathFromUser } from "@/lib/auth/callbackDestination";
import { getSiteUrl } from "@/lib/marketing/site";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteUrl();

  const tokenHash =
    url.searchParams.get("token_hash");
  const requestedType =
    url.searchParams.get("type");
  const requestedNext =
    url.searchParams.get("next");

  const otpType =
    requestedType as EmailOtpType;

  const fallbackNextPath = resolveConfirmNextPath(
    requestedNext,
    otpType
  );

  console.info("Auth confirmation request", {
    hasTokenHash: Boolean(tokenHash),
    type: requestedType,
    nextPath: fallbackNextPath,
    origin,
  });

  if (
    !tokenHash ||
    !requestedType ||
    !ALLOWED_OTP_TYPES.has(otpType)
  ) {
    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Invalid or incomplete authentication link."
        ),
        origin
      )
    );
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

  if (error) {
    console.error(
      "Supabase email verification failed",
      {
        type: requestedType,
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "This invitation link is invalid or has expired."
        ),
        origin
      )
    );
  }

  const nextPath = data.user
    ? resolveInviteNextPathFromUser(
        requestedNext,
        data.user
      )
    : fallbackNextPath;

  console.info("Auth confirmation success", {
    type: requestedType,
    nextPath,
  });

  return NextResponse.redirect(
    new URL(nextPath, origin)
  );
}
