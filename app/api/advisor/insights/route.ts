import { NextResponse } from "next/server";

import { buildHomeAdvisorResult } from "@/lib/advisor";
import {
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";
import { resolveHouseholdAccess } from "@/lib/data/householdScope";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  logAdvisorStage("route.start", "route");

  try {
    const supabase = await createClient();

    logAdvisorStage("auth.start", "auth");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logAdvisorStage("auth.error", "auth", {
        error: toAdvisorDbError(userError),
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "You must be signed in to view Home Advisor insights.",
        },
        { status: 401 }
      );
    }

    logAdvisorStage("auth.success", "auth");

    logAdvisorStage("scope.resolve.start", "scope");

    const { householdId, householdOwnerId } =
      await resolveHouseholdAccess(
        user.id,
        supabase
      );

    logAdvisorStage("scope.resolve.success", "scope");

    const result = await buildHomeAdvisorResult(
      supabase,
      user.id,
      {
        householdId,
        householdOwnerId,
      }
    );

    logAdvisorStage("route.complete", "route");

    return NextResponse.json({
      success: true,
      advisor: result,
    });
  } catch (error) {
    logAdvisorStage("route.error", "route", {
      error: toAdvisorDbError(error),
    });

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load Home Advisor insights right now.",
      },
      { status: 500 }
    );
  }
}
