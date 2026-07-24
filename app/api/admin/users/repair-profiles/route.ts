import { NextResponse } from "next/server";

import { repairMissingAuthProfiles } from "@/lib/admin/data/profileSync";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requirePlatformAdminSession();

    const admin = createAdminClient();
    const repaired = await repairMissingAuthProfiles(
      admin,
      { maxRepairs: 500 }
    );

    return NextResponse.json({
      success: true,
      repaired,
      message:
        repaired > 0
          ? `Repaired ${repaired} missing profile record${repaired === 1 ? "" : "s"}.`
          : "All Auth users already have matching profile records.",
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Repair missing profiles error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to repair missing profile records.",
      },
      { status: 500 }
    );
  }
}
