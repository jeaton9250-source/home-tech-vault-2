import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { loadAdminUserDetail } from "@/lib/admin/data/loaders";

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
    const user = await loadAdminUserDetail(id);

    if (!user) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin user detail error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load user." },
      { status: 500 }
    );
  }
}
