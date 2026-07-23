import { computeDiscoveryStats } from "@/lib/connector/discoveryStats";
import { loadDiscoveryReviewRows } from "@/lib/connector/discoverySync";
import {
  householdAccessResponse,
  requireHouseholdMember,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const householdId = searchParams.get(
      "householdId"
    );

    const memberContext =
      await requireHouseholdMember(
        householdId
      );

    const admin = createAdminClient();

    const devices =
      await loadDiscoveryReviewRows(
        admin,
        memberContext.householdId
      );

    const stats = computeDiscoveryStats({
      devices,
    });

    return NextResponse.json({
      householdId: memberContext.householdId,
      devices,
      stats,
    });
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return NextResponse.json(
        { error: accessResponse.message },
        { status: accessResponse.status }
      );
    }

    console.error(
      "Discovery review list error:",
      error instanceof Error
        ? error.message
        : error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
