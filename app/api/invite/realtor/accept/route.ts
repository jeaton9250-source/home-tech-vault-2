import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime =
  "nodejs";

function cleanText(
  value: unknown,
  maxLength = 100
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth
        .getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Your invitation session has expired. Open the invitation email again.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as {
        firstName?: string;
        lastName?: string;
      };

    const firstName =
      cleanText(
        body.firstName,
        80
      );

    const lastName =
      cleanText(
        body.lastName,
        80
      );

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your first and last name.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      createAdminClient();

    /*
     * This database record is the authorization source
     * of truth.
     *
     * We do NOT trust editable Supabase user_metadata
     * alone to grant Realtor access.
     */
    const {
      data: partner,
      error: partnerError,
    } = await admin
      .from(
        "realtor_partners"
      )
      .select(
        `
          id,
          user_id,
          brokerage_name,
          license_state,
          referral_code,
          status
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    if (partnerError) {
      throw partnerError;
    }

    if (!partner) {
      return NextResponse.json(
        {
          error:
            "This account does not have a Realtor invitation.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      partner.status ===
      "suspended"
    ) {
      return NextResponse.json(
        {
          error:
            "This Realtor account has been suspended.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * A Realtor-only account must never receive an
     * automatically created personal household.
     */
    const {
      data: ownedHouseholds,
      error:
        householdError,
    } = await admin
      .from("households")
      .select("id")
      .eq(
        "owner_id",
        user.id
      )
      .limit(1);

    if (householdError) {
      throw householdError;
    }

    if (
      (ownedHouseholds ?? [])
        .length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This account already owns a personal household and cannot be activated as Realtor-only.",
        },
        {
          status: 409,
        }
      );
    }

    const now =
      new Date()
        .toISOString();

    const fullName =
      `${firstName} ${lastName}`
        .trim();

    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .upsert({
        id: user.id,
        full_name:
          fullName,

        /*
         * Mark onboarding complete without creating
         * a household.
         */
        onboarding_completed_at:
          now,
        onboarding_step:
          "complete",
        onboarding_skipped_at:
          null,
      });

    if (profileError) {
      throw profileError;
    }

    const {
      error:
        activateError,
    } = await admin
      .from(
        "realtor_partners"
      )
      .update({
        status:
          "active",
        updated_at:
          now,
      })
      .eq(
        "id",
        partner.id
      )
      .eq(
        "user_id",
        user.id
      );

    if (activateError) {
      throw activateError;
    }

    return NextResponse.json({
      success: true,
      redirectTo:
        "/realtor",
    });
  } catch (error) {
    console.error(
      "[realtor-accept] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to finish Realtor account setup.",
      },
      {
        status: 500,
      }
    );
  }
}
