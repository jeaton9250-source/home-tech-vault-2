import { NextResponse } from "next/server";

import { loadAdminNotifications } from "@/lib/admin/data/connectors";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePlatformAdminSession();

    const notifications =
      await loadAdminNotifications();

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin notifications error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load notifications." },
      { status: 500 }
    );
  }
}
