import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  verifyUnsubscribeSignature,
} from "@/lib/lifecycle/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(
  title: string,
  message: string
) {
  return `<!doctype html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1"
    />
    <title>${title}</title>
  </head>

  <body
    style="
      margin:0;
      background:#eee9df;
      font-family:Arial,Helvetica,sans-serif;
      color:#17212a;
    "
  >
    <main
      style="
        max-width:620px;
        margin:80px auto;
        padding:24px;
      "
    >
      <div
        style="
          background:#f8f5ef;
          border:1px solid rgba(24,37,51,.10);
          border-radius:24px;
          padding:36px;
        "
      >
        <div
          style="
            color:#617c43;
            font-size:11px;
            font-weight:700;
            letter-spacing:.14em;
            text-transform:uppercase;
          "
        >
          Home Tech Vault
        </div>

        <h1
          style="
            margin:12px 0 14px;
            font-family:Georgia,serif;
            font-weight:500;
          "
        >
          ${title}
        </h1>

        <p
          style="
            color:#4f5b63;
            line-height:1.7;
          "
        >
          ${message}
        </p>

        <a
          href="/"
          style="
            display:inline-block;
            margin-top:16px;
            color:#617c43;
            font-weight:700;
          "
        >
          Return to Home Tech Vault
        </a>
      </div>
    </main>
  </body>
</html>`;
}

export async function GET(
  request: Request
) {
  const url =
    new URL(request.url);

  const userId =
    url.searchParams.get("uid");

  const email =
    url.searchParams.get("email");

  const signature =
    url.searchParams.get("sig");

  if (
    !userId ||
    !email ||
    !signature
  ) {
    return new NextResponse(
      page(
        "Invalid link",
        "This unsubscribe link is incomplete."
      ),
      {
        status: 400,
        headers: {
          "content-type":
            "text/html; charset=utf-8",
        },
      }
    );
  }

  let valid = false;

  try {
    valid =
      verifyUnsubscribeSignature(
        userId,
        email,
        signature
      );
  } catch (error) {
    console.error(
      "[lifecycle-email] unsubscribe verification failed",
      error
    );
  }

  if (!valid) {
    return new NextResponse(
      page(
        "Invalid link",
        "This unsubscribe link could not be verified."
      ),
      {
        status: 400,
        headers: {
          "content-type":
            "text/html; charset=utf-8",
        },
      }
    );
  }

  const admin =
    createAdminClient();

  const {
    error,
  } = await admin
    .from(
      "lifecycle_email_preferences"
    )
    .upsert(
      {
        user_id: userId,
        onboarding_enabled:
          false,
        unsubscribed_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "user_id",
      }
    );

  if (error) {
    console.error(
      "[lifecycle-email] unsubscribe failed",
      error
    );

    return new NextResponse(
      page(
        "Something went wrong",
        "We could not update your email preference. Please contact support@hometechvault.com."
      ),
      {
        status: 500,
        headers: {
          "content-type":
            "text/html; charset=utf-8",
        },
      }
    );
  }

  return new NextResponse(
    page(
      "You're unsubscribed",
      "You will no longer receive Home Tech Vault onboarding reminder emails. Essential account, security, billing, and service emails are not affected."
    ),
    {
      status: 200,
      headers: {
        "content-type":
          "text/html; charset=utf-8",
      },
    }
  );
}
