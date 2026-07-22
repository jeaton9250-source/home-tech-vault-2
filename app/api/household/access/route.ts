/**
 * Secure household access for effective plan resolution.
 *
 * The billing owner is `households.owner_id`. Owner subscription data is read
 * with the admin client so invited members inherit Family access even when RLS
 * would block direct client reads of the owner's `user_subscriptions` row.
 */
import { NextResponse } from "next/server";

import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type HouseholdAccessResponse = {
  householdId: string;
  householdOwnerId: string;
  rawHouseholdRole: string;
  ownerPlan: string | null;
  ownerStatus: string | null;
  ownerCurrentPeriodEnd: string | null;
  ownerName: string | null;
};

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const requestedHouseholdId =
      url.searchParams.get("householdId");

    const admin = createAdminClient();

    const membershipResult =
      await loadHouseholdMembershipForUser(
        admin,
        user.id,
        requestedHouseholdId
      );

    if (
      !membershipResult.membership ||
      !membershipResult.householdId
    ) {
      return NextResponse.json({
        membership: null,
      });
    }

    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .select("id, owner_id")
      .eq("id", membershipResult.householdId)
      .maybeSingle();

    if (householdError) {
      throw householdError;
    }

    if (!household) {
      return NextResponse.json({
        membership: null,
      });
    }

    const [
      subscriptionResult,
      profileResult,
    ] = await Promise.all([
      admin
        .from("user_subscriptions")
        .select(
          "plan, status, current_period_end"
        )
        .eq(
          "user_id",
          household.owner_id
        )
        .maybeSingle(),

      admin
        .from("profiles")
        .select("full_name")
        .eq("id", household.owner_id)
        .maybeSingle(),
    ]);

    if (subscriptionResult.error) {
      throw subscriptionResult.error;
    }

    const payload: HouseholdAccessResponse =
      {
        householdId: household.id,
        householdOwnerId:
          household.owner_id,
        rawHouseholdRole:
          membershipResult.rawHouseholdRole ??
          "viewer",
        ownerPlan:
          subscriptionResult.data?.plan ??
          null,
        ownerStatus:
          subscriptionResult.data
            ?.status ?? null,
        ownerCurrentPeriodEnd:
          subscriptionResult.data
            ?.current_period_end ??
          null,
        ownerName:
          profileResult.data?.full_name?.trim() ??
          null,
      };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "Household access lookup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load household access.",
      },
      { status: 500 }
    );
  }
}
