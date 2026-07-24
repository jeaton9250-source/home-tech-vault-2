import { NextResponse } from "next/server";

import { resolveInviteNextPathFromUser } from "@/lib/auth/callbackDestination";
import { authConfirmErrorPath } from "@/lib/auth/confirmRoute";
import { getSiteUrl } from "@/lib/marketing/site";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteUrl();
  const code = url.searchParams.get("code");
  const requestedNext =
    url.searchParams.get("next");
  const authError =
    url.searchParams.get("error");
  const authErrorDescription =
    url.searchParams.get("error_description");

  if (authError) {
    console.error(
      "[auth-callback] Provider returned an error:",
      {
        error: authError,
        description: authErrorDescription,
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

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.exchangeCodeForSession(code);

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

  const destination = resolveInviteNextPathFromUser(
    requestedNext,
    data.session?.user ?? null
  );

  console.info("[auth-callback] PKCE success", {
    destination,
  });

  return NextResponse.redirect(
    new URL(destination, origin)
  );
}
