import { NextResponse } from "next/server";

import { toSafeGrantSummary } from "@/lib/plan-grants/grantAccess";
import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const grant =
      await loadActivePlanGrantForUser(
        supabase,
        user.id
      );

    return NextResponse.json({
      grant: toSafeGrantSummary(grant),
    });
  } catch (error) {
    console.error(
      "Plan grant lookup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load plan grant.",
      },
      { status: 500 }
    );
  }
}
