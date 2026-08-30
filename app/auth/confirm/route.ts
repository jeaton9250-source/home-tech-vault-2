import {
  type EmailOtpType,
} from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  authConfirmErrorPath,
  resolveConfirmNextPath,
} from "@/lib/auth/confirmRoute";
import { resolveInviteNextPathFromUser } from "@/lib/auth/callbackDestination";
import {
  describeEmailTokenHash,
  tokenLooksLikeJwt,
} from "@/lib/auth/emailTokenHash";
import { getSiteUrl } from "@/lib/marketing/site";
import {
  createAuthVerificationClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteUrl();

  const tokenHash =
    url.searchParams
      .get("token_hash")
      ?.trim() ?? null;
  const requestedType =
    url.searchParams.get("type")?.trim() ??
    null;
  const requestedNext =
    url.searchParams.get("next");

  console.info("Invite token received", {
    ...describeEmailTokenHash(tokenHash),
    type: requestedType,
  });

  const otpType =
    requestedType as EmailOtpType;
  const fallbackNextPath = resolveConfirmNextPath(
    requestedNext,
    otpType
  );

  if (
    !tokenHash ||
    (
      requestedType !== "invite" &&
      requestedType !== "email"
    )
  ) {
    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Invalid invitation link."
        ),
        origin
      )
    );
  }

  if (tokenLooksLikeJwt(tokenHash)) {
    console.error(
      "Invite confirmation received a JWT instead of an OTP hash",
      {
        tokenLength: tokenHash.length,
        looksLikeJwt: true,
      }
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "The invitation link was generated incorrectly."
        ),
        origin
      )
    );
  }

  const supabase =
    await createAuthVerificationClient();

  const { data, error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

  if (error) {
    console.error(
      "Invitation OTP verification failed",
      {
        message: error.message,
        status: error.status,
        code: error.code,
        tokenLength: tokenHash.length,
        looksLikeJwt: tokenLooksLikeJwt(
          tokenHash
        ),
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

  if (!data.user) {
    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Invitation verification did not create a user session."
        ),
        origin
      )
    );
  }

  const nextPath = resolveInviteNextPathFromUser(
    requestedNext,
    data.user
  );

  console.info("Auth confirmation success", {
    type: requestedType,
    nextPath: nextPath || fallbackNextPath,
  });

  return NextResponse.redirect(
    new URL(
      nextPath || fallbackNextPath,
      origin
    )
  );
}
