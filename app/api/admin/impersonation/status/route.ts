import { NextResponse } from "next/server";

import {
  clearImpersonationRecovery,
  getImpersonationRecovery,
} from "@/lib/admin/impersonation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recovery =
      await getImpersonationRecovery();

    if (!recovery) {
      return NextResponse.json({
        active: false,
      });
    }

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    /*
     * A recovery cookie should only be
     * considered active while the browser
     * is authenticated as its target.
     */
    if (
      !user ||
      user.id !==
        recovery.targetUserId
    ) {
      await clearImpersonationRecovery();

      return NextResponse.json({
        active: false,
      });
    }

    return NextResponse.json({
      active: true,
      target: {
        userId:
          recovery.targetUserId,
        email:
          recovery.targetEmail,
        name:
          recovery.targetName,
      },
      expiresAt:
        recovery.expiresAt,
    });
  } catch (error) {
    console.error(
      "Unable to read impersonation state:",
      error
    );

    return NextResponse.json({
      active: false,
    });
  }
}
