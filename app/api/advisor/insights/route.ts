import { NextResponse } from "next/server";

import { buildHomeAdvisorResult } from "@/lib/advisor";
import { resolveHouseholdAccess } from "@/lib/data/householdScope";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be signed in to view Home Advisor insights.",
        },
        { status: 401 }
      );
    }

    const { householdId, householdOwnerId } =
      await resolveHouseholdAccess(
        user.id,
        supabase
      );

    const result = await buildHomeAdvisorResult(
      supabase,
      user.id,
      {
        householdId,
        householdOwnerId,
      }
    );

    return NextResponse.json({
      success: true,
      advisor: result,
    });
  } catch (error) {
    console.error(
      "[home-advisor] route error:",
      error
    );

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
