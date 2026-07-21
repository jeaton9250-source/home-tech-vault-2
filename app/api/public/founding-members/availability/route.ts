import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicFoundingProgramSummary } from "@/lib/founding-members/loaders";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = createAdminClient();
    const summary =
      await loadPublicFoundingProgramSummary(
        admin
      );

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error(
      "Public founding members availability error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load program availability.",
      },
      { status: 500 }
    );
  }
}
