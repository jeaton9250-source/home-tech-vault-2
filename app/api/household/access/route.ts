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
import {
  isSafeUuid,
} from "@/lib/security/supabaseFilters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function privateJson(
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set(
    "Pragma",
    "no-cache"
  );

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}


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
  effectivePlan: "free" | "pro" | "family";
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
      return privateJson(
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
      url.searchParams
        .get("householdId")
        ?.trim() ||
      null;

    if (
      requestedHouseholdId &&
      !isSafeUuid(requestedHouseholdId)
    ) {
      return privateJson(
        {
          error:
            "Invalid household identifier.",
        },
        { status: 400 }
      );
    }

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
      return privateJson(
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
      return privateJson(
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
        effectivePlan:
          entitlement.effectivePlan,
        canUseProFeatures:
          entitlement.canUseProFeatures,
      };

    return privateJson(payload, {
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

    return privateJson(
      {
        error:
          "Unable to load household access.",
      },
      { status: 500 }
    );
  }
}
