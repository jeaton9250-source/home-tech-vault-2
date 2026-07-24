import { NextResponse } from "next/server";

import { loadAdminActivityEvents } from "@/lib/admin/data/activity";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);

    const events = await loadAdminActivityEvents({
      q: url.searchParams.get("q") ?? undefined,
      kind:
        url.searchParams.get("kind") ?? undefined,
      limit: Number(
        url.searchParams.get("limit") ?? "100"
      ),
    });

    return NextResponse.json({ events });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin activity error:", error);

    return NextResponse.json(
      { error: "Unable to load activity." },
      { status: 500 }
    );
  }
}
