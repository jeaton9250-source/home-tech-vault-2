import { NextResponse } from "next/server";

import { processAccountDeletionRequests } from "@/lib/account-deletion/processRequests";

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
    const result = await processAccountDeletionRequests();
    return NextResponse.json({ ok: true, ...result }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[account-deletions] cron failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "Account deletion requests could not be processed." },
      { status: 500 },
    );
  }
}
