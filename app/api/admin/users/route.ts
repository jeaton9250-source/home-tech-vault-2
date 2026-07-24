import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { loadAdminUsers } from "@/lib/admin/data/loaders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);

    const result = await loadAdminUsers({
      pagination: {
        page: url.searchParams.get("page"),
        limit: url.searchParams.get("limit"),
      },
      q: url.searchParams.get("q") ?? undefined,
      plan:
        url.searchParams.get("plan") ??
        undefined,
      admin:
        url.searchParams.get("admin") ??
        undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin users list error:", error);

    return NextResponse.json(
      { error: "Unable to load users." },
      { status: 500 }
    );
  }
}
