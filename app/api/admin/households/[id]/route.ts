import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { loadAdminHouseholdDetail } from "@/lib/admin/data/loaders";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requirePlatformAdminSession();

    const { id } = await context.params;
    const household =
      await loadAdminHouseholdDetail(id);

    if (!household) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ household });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin household detail error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load household." },
      { status: 500 }
    );
  }
}
