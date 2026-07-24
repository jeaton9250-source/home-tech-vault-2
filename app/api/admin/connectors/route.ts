import { NextResponse } from "next/server";

import { loadAdminConnectors } from "@/lib/admin/data/connectors";
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

    const connectors = await loadAdminConnectors({
      q: url.searchParams.get("q") ?? undefined,
      status:
        url.searchParams.get("status") ??
        undefined,
      limit: Number(
        url.searchParams.get("limit") ?? "100"
      ),
    });

    return NextResponse.json({ connectors });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin connectors error:", error);

    return NextResponse.json(
      { error: "Unable to load connectors." },
      { status: 500 }
    );
  }
}
