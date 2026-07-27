import { NextResponse } from "next/server";

import { resolveHouseholdAccess } from "@/lib/data/householdScope";
import { runSmartSearch } from "@/lib/search/deviceSearch";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    console.info("[smart-search]", {
      stage: "route.start",
      category: "route",
    });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[smart-search]", {
        stage: "route.auth.error",
        category: "auth",
        code: userError?.code ?? null,
        message: userError?.message ?? null,
        details: userError?.message ?? null,
        hint: null,
      });

      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to search your vault.",
        },
        { status: 401 }
      );
    }

    console.info("[smart-search]", {
      stage: "route.auth.success",
      category: "auth",
    });

    const { householdId, householdOwnerId } =
      await resolveHouseholdAccess(user.id, supabase);

    console.info("[smart-search]", {
      stage: "route.scope.resolved",
      category: "scope",
    });

    const response = await runSmartSearch({
      supabase,
      userId: user.id,
      householdId,
      householdOwnerId,
      query,
    });

    console.info("[smart-search]", {
      stage: "route.search.complete",
      category: "route",
    });

    return NextResponse.json(response);
  } catch (error) {
    const safeError = error as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };

    console.error("[smart-search]", {
      stage: "route.error",
      category: "route",
      code: safeError?.code ?? null,
      message: safeError?.message ?? null,
      details: safeError?.details ?? null,
      hint: safeError?.hint ?? null,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Unable to search your home technology right now.",
      },
      { status: 500 }
    );
  }
}
