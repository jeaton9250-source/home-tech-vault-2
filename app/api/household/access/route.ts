/**
 * Secure household access for effective plan resolution.
 *
 * The billing owner is `households.owner_id`. Owner subscription data is read
 * with the admin client so invited members inherit Pro/Family access even when
 * RLS would block direct client reads of the owner's billing row or grant.
 */
import { NextResponse } from "next/server";

import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";
import { resolveHouseholdOwnerBilling } from "@/lib/permissions/householdOwnerBilling";
import {
  householdOwnerHasGrantingPremiumPlan,
  householdOwnerHasGrantingProPlan,
  isSubscriptionGrantingAccess,
  normalizeSubscriptionPlan,
} from "@/lib/permissions/subscriptionAccess";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HouseholdAccessResponse = {
  householdId: string;
  householdOwnerId: string;
  rawHouseholdRole: string;
  ownerPlan: string | null;
  ownerStatus: string | null;
  ownerCurrentPeriodEnd: string | null;
  ownerName: string | null;
  ownerPlanSource:
    | "subscription"
    | "admin_grant"
    | "none";
  ownerGrantsPro: boolean;
  ownerGrantsPremium: boolean;
  effectivePlan: "free" | "pro" | "family";
  inheritsProPlan: boolean;
  inheritsFamilyPlan: boolean;
  canUseProFeatures: boolean;
};

function resolveMemberEntitlement(options: {
  ownerPlan: string | null;
  ownerStatus: string | null;
  ownerCurrentPeriodEnd: string | null;
  ownerGrantsPro: boolean;
  ownerGrantsPremium: boolean;
}) {
  const normalizedOwnerPlan =
    normalizeSubscriptionPlan(
      options.ownerPlan
    );

  const ownerGrantsHouseholdAccess =
    isSubscriptionGrantingAccess(
      normalizedOwnerPlan,
      options.ownerStatus,
      options.ownerCurrentPeriodEnd
    );

  const inheritsHouseholdPlan =
    ownerGrantsHouseholdAccess &&
    normalizedOwnerPlan !== "free";

  const inheritsProPlan =
    inheritsHouseholdPlan &&
    normalizedOwnerPlan === "pro";

  const inheritsFamilyPlan =
    inheritsHouseholdPlan &&
    normalizedOwnerPlan === "family";

  const effectivePlan: "free" | "pro" | "family" =
    inheritsHouseholdPlan
      ? normalizedOwnerPlan
      : "free";

  const canUseProFeatures =
    effectivePlan === "pro" ||
    effectivePlan === "family";

  return {
    effectivePlan,
    inheritsProPlan,
    inheritsFamilyPlan,
    canUseProFeatures,
    ownerGrantsPro:
      options.ownerGrantsPro ||
      householdOwnerHasGrantingProPlan(
        options.ownerPlan,
        options.ownerStatus,
        options.ownerCurrentPeriodEnd
      ),
    ownerGrantsPremium:
      options.ownerGrantsPremium ||
      householdOwnerHasGrantingPremiumPlan(
        options.ownerPlan,
        options.ownerStatus,
        options.ownerCurrentPeriodEnd
      ),
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
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
      return NextResponse.json(
        { membership: null },
        {
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
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
      return NextResponse.json(
        { membership: null },
        {
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        }
      );
    }

    const [
      ownerBilling,
      profileResult,
    ] = await Promise.all([
      resolveHouseholdOwnerBilling(
        admin,
        household.owner_id
      ),

      admin
        .from("profiles")
        .select("full_name")
        .eq("id", household.owner_id)
        .maybeSingle(),
    ]);

    const entitlement =
      resolveMemberEntitlement({
        ownerPlan: ownerBilling.ownerPlan,
        ownerStatus: ownerBilling.ownerStatus,
        ownerCurrentPeriodEnd:
          ownerBilling.ownerCurrentPeriodEnd,
        ownerGrantsPro:
          ownerBilling.ownerGrantsPro,
        ownerGrantsPremium:
          ownerBilling.ownerGrantsPremium,
      });

    const payload: HouseholdAccessResponse =
      {
        householdId: household.id,
        householdOwnerId:
          household.owner_id,
        rawHouseholdRole:
          membershipResult.rawHouseholdRole ??
          membershipResult.membership.role,
        ownerPlan:
          ownerBilling.ownerPlan,
        ownerStatus:
          ownerBilling.ownerStatus,
        ownerCurrentPeriodEnd:
          ownerBilling.ownerCurrentPeriodEnd,
        ownerName:
          profileResult.data?.full_name?.trim() ??
          null,
        ownerPlanSource:
          ownerBilling.ownerPlanSource,
        ownerGrantsPro:
          entitlement.ownerGrantsPro,
        ownerGrantsPremium:
          entitlement.ownerGrantsPremium,
        effectivePlan:
          entitlement.effectivePlan,
        inheritsProPlan:
          entitlement.inheritsProPlan,
        inheritsFamilyPlan:
          entitlement.inheritsFamilyPlan,
        canUseProFeatures:
          entitlement.canUseProFeatures,
      };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          "private, no-store, max-age=0",
      },
    });
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
