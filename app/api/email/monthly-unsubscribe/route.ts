
import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  verifyMonthlyUnsubscribeSignature,
} from "@/lib/monthly/unsubscribe";

export const runtime =
  "nodejs";

function page(
  title: string,
  body: string
) {
  return `<!doctype html>
<html>
  <body
    style="
      margin:0;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#eee9df;
      font-family:Arial,sans-serif;
      color:#17212a;
    "
  >
    <main
      style="
        width:min(520px,calc(100% - 32px));
        background:#f8f5ef;
        border:1px solid rgba(24,37,51,.10);
        border-radius:24px;
        padding:32px;
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
          margin:14px 0 0;
          font-family:Georgia,serif;
          font-size:30px;
          font-weight:500;
        "
      >
        ${title}
      </h1>

      <p
        style="
          margin:16px 0 0;
          color:#68737b;
          font-size:15px;
          line-height:24px;
        "
      >
        ${body}
      </p>
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
    url.searchParams.get(
      "uid"
    );

  const email =
    url.searchParams.get(
      "email"
    );

  const signature =
    url.searchParams.get(
      "sig"
    );

  if (
    !userId ||
    !email ||
    !signature
  ) {
    return new NextResponse(
      page(
        "Unable to update preferences",
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
      verifyMonthlyUnsubscribeSignature(
        userId,
        email,
        signature
      );
  } catch {
    valid = false;
  }

  if (!valid) {
    return new NextResponse(
      page(
        "Unable to update preferences",
        "This unsubscribe link is invalid or no longer usable."
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
        user_id:
          userId,

        monthly_report_enabled:
          false,

        updated_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "user_id",
      }
    );

  if (error) {
    return new NextResponse(
      page(
        "Something went wrong",
        "We could not update your email preferences. Please try again."
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
      "Monthly reports stopped",
      "You will no longer receive the monthly Vault Health Report. Essential account, security, billing, and service emails are unaffected."
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
