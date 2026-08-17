
import {
  NextResponse,
} from "next/server";

import {
  runMonthlyVaultReports,
} from "@/lib/monthly/runMonthlyVaultReports";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function authorized(
  request: Request
) {
  const secret =
    process.env.CRON_SECRET
      ?.trim();

  if (!secret) {
    return false;
  }

  return (
    request.headers.get(
      "authorization"
    ) ===
    `Bearer ${secret}`
  );
}

export async function GET(
  request: Request
) {
  if (
    !authorized(request)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unauthorized",
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
    (
      process.env
        .MONTHLY_VAULT_REPORTS_ENABLED ??
      "false"
    ).toLowerCase() ===
    "true";

  if (
    !enabled &&
    !dryRun
  ) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      message:
        "Monthly vault reports are disabled.",
    });
  }

  try {
    const result =
      await runMonthlyVaultReports({
        dryRun,
      });

    return NextResponse.json({
      ok: true,
      enabled,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Monthly report run failed.",
      },
      {
        status: 500,
      }
    );
  }
}
