import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/set-password";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(
    requestUrl.searchParams.get("next")
  );
  const origin = requestUrl.origin;

  if (!code) {
    console.error("[auth-callback] Missing authorization code.");

    return NextResponse.redirect(
      `${origin}/login?error=missing_auth_code`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth-callback] Session exchange failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
