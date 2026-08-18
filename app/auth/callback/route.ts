import { NextResponse } from "next/server";

import { resolveInviteNextPathFromUser } from "@/lib/auth/callbackDestination";
import { authConfirmErrorPath } from "@/lib/auth/confirmRoute";
import { getSiteUrl } from "@/lib/marketing/site";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  /*
   * OAuth must finish on the same origin that started it.
   *
   * Local development:
   *   http://localhost:3000
   *
   * Production:
   *   https://www.hometechvault.com
   *
   * Using the production URL during a localhost OAuth
   * callback causes the new session cookie to be left
   * behind on localhost.
   */
  const isLocalRequest =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1";

  const origin = isLocalRequest
    ? url.origin
    : getSiteUrl();

  const code =
    url.searchParams.get("code");

  const requestedNext =
    url.searchParams.get("next");

  const authError =
    url.searchParams.get("error");

  const authErrorDescription =
    url.searchParams.get(
      "error_description"
    );

  console.info(
    "[auth-callback] OAuth callback",
    {
      requestOrigin: url.origin,
      redirectOrigin: origin,
      isLocalRequest,
      requestedNext,
      hasCode: Boolean(code),
      hasProviderError:
        Boolean(authError),
    }
  );

  if (authError) {
    console.error(
      "[auth-callback] Provider returned an error:",
      {
        error: authError,
        description:
          authErrorDescription,
      }
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Authentication could not be completed."
        ),
        origin
      )
    );
  }

  if (!code) {
    console.error(
      "[auth-callback] Missing PKCE authorization code."
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Invalid or incomplete authentication link."
        ),
        origin
      )
    );
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      "[auth-callback] Session exchange failed:",
      {
        message: error.message,
        status: error.status,
        code: error.code,
      }
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Authentication could not be completed."
        ),
        origin
      )
    );
  }

  if (!data.session?.user) {
    console.error(
      "[auth-callback] OAuth completed without a user session."
    );

    return NextResponse.redirect(
      new URL(
        authConfirmErrorPath(
          "Your Google account could not be signed in."
        ),
        origin
      )
    );
  }

  const destination =
    resolveInviteNextPathFromUser(
      requestedNext,
      data.session.user
    );

  console.info(
    "[auth-callback] PKCE success",
    {
      destination,
      redirectOrigin: origin,
    }
  );

  return NextResponse.redirect(
    new URL(destination, origin)
  );
}
