import {
  NextResponse,
} from "next/server";

import {
  runLifecycleEmails,
} from "@/lib/lifecycle/runLifecycleEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(
  request: Request
) {
  const configuredSecret =
    process.env.CRON_SECRET?.trim();

  if (!configuredSecret) {
    return false;
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  return (
    authorization ===
    `Bearer ${configuredSecret}`
  );
}

export async function GET(
  request: Request
) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const url =
    new URL(request.url);

  const dryRun =
    url.searchParams.get(
      "dryRun"
    ) === "1";

  const enabled =
    process.env
      .LIFECYCLE_EMAILS_ENABLED
      ?.trim()
      .toLowerCase() ===
    "true";

  if (!enabled && !dryRun) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      message:
        "Lifecycle emails are disabled.",
    });
  }

  try {
    const result =
      await runLifecycleEmails({
        dryRun,
      });

    return NextResponse.json({
      ok: true,
      enabled,
      ...result,
    });
  } catch (error) {
    console.error(
      "[lifecycle-email] cron failed",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Lifecycle email run failed.",
      },
      {
        status: 500,
      }
    );
  }
}
