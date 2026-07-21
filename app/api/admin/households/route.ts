import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { loadAdminHouseholds } from "@/lib/admin/data/loaders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);

    const result = await loadAdminHouseholds({
      pagination: {
        page: url.searchParams.get("page"),
        limit: url.searchParams.get("limit"),
      },
      q: url.searchParams.get("q") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin households list error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load households." },
      { status: 500 }
    );
  }
}
