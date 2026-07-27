import { NextResponse } from "next/server";

import { resolveHouseholdAccess } from "@/lib/data/householdScope";
import { runSmartSearch } from "@/lib/search/deviceSearch";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to search your vault.",
        },
        { status: 401 }
      );
    }

    const { householdId, householdOwnerId } =
      await resolveHouseholdAccess(user.id, supabase);

    const response = await runSmartSearch({
      supabase,
      userId: user.id,
      householdId,
      householdOwnerId,
      query,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Smart search route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to search your home technology right now.",
      },
      { status: 500 }
    );
  }
}
