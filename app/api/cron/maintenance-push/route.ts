import { NextResponse } from "next/server";

import { runMaintenancePushReminders } from "@/lib/push/runMaintenancePushReminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
    const result = await runMaintenancePushReminders({ dryRun });
    return NextResponse.json({ ok: true, ...result }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error(
      "[maintenance-push] cron failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { ok: false, error: "Maintenance reminders could not be processed." },
      { status: 500 },
    );
  }
}
