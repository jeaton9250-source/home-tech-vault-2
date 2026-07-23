import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAdminPendingInvitations } from "@/lib/admin/invitations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();
    const admin = createAdminClient();
    const url = new URL(request.url);

    const invitations = await loadAdminPendingInvitations(
      admin,
      {
        q: url.searchParams.get("q") ?? undefined,
        role: url.searchParams.get("role") ?? undefined,
        householdId:
          url.searchParams.get("householdId") ?? undefined,
      }
    );

    return NextResponse.json({ invitations });
  } catch (error) {
    const accessResponse = platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin invitations list error:", error);

    return NextResponse.json(
      { error: "Unable to load invitations." },
      { status: 500 }
    );
  }
}
