import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { loadAdminSubscriptions } from "@/lib/admin/data/loaders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);

    const result =
      await loadAdminSubscriptions({
        pagination: {
          page: url.searchParams.get("page"),
          limit: url.searchParams.get("limit"),
        },
        plan:
          url.searchParams.get("plan") ??
          undefined,
        status:
          url.searchParams.get("status") ??
          undefined,
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
      "Admin subscriptions list error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load subscriptions.",
      },
      { status: 500 }
    );
  }
}
