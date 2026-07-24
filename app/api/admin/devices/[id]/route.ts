import { NextResponse } from "next/server";

import { loadAdminDeviceDetail } from "@/lib/admin/data/devices";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

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
    const device = await loadAdminDeviceDetail(id);

    if (!device) {
      return NextResponse.json(
        { error: "Device not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin device detail error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load device." },
      { status: 500 }
    );
  }
}
