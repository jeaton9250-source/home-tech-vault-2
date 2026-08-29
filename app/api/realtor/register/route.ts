import {
  randomUUID,
} from "node:crypto";

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
  maxLength = 160
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

function buildReferralCode() {
  return `HTV-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

export async function POST() {
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
            "Sign in to finish creating your Realtor account.",
        },
        {
          status: 401,
        }
      );
    }

    const metadata =
      (user.user_metadata ??
        {}) as Record<
        string,
        unknown
      >;

    /*
     * Metadata helps confirm that this
     * account entered through the public
     * Realtor enrollment flow.
     *
     * The realtor_partners row below is
     * still the actual authorization
     * source of truth.
     */
    const realtorSignup =
      metadata.realtor_public_signup ===
        true ||
      metadata.onboarding_mode ===
        "realtor" ||
      metadata.account_role ===
        "realtor";

    if (!realtorSignup) {
      return NextResponse.json(
        {
          error:
            "This account was not started through Realtor registration.",
        },
        {
          status: 403,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: profile,
      error: profileLookupError,
    } = await admin
      .from("profiles")
      .select(
        "is_admin"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

    if (profileLookupError) {
      throw profileLookupError;
    }

    /*
     * Platform admins keep their normal
     * account behavior and should never
     * be converted into Realtor-only.
     */
    if (
      profile?.is_admin === true
    ) {
      return NextResponse.json(
        {
          error:
            "Platform administrator accounts cannot be converted to Realtor-only accounts.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: ownedHouseholds,
      error: householdError,
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
            "This account already owns a personal Home Tech Vault household. Use a separate email address for a Realtor-only account.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: existingPartner,
      error:
        partnerLookupError,
    } = await admin
      .from(
        "realtor_partners"
      )
      .select(
        `
          id,
          status
        `
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    if (partnerLookupError) {
      throw partnerLookupError;
    }

    if (
      existingPartner?.status ===
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

    const firstName =
      cleanText(
        metadata.first_name,
        80
      );

    const lastName =
      cleanText(
        metadata.last_name,
        80
      );

    const fullName =
      cleanText(
        metadata.full_name,
        160
      ) ||
      [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      user.email ||
      "Realtor";

    const brokerageName =
      cleanText(
        metadata.brokerage_name,
        160
      ) || null;

    const licenseState =
      cleanText(
        metadata.license_state,
        40
      ).toUpperCase() ||
      null;

    const now =
      new Date()
        .toISOString();

    if (!existingPartner) {
      const {
        error:
          partnerCreateError,
      } = await admin
        .from(
          "realtor_partners"
        )
        .insert({
          user_id:
            user.id,
          brokerage_name:
            brokerageName,
          license_state:
            licenseState,
          referral_code:
            buildReferralCode(),
          status:
            "active",
        });

      if (partnerCreateError) {
        /*
         * A simultaneous setup request may
         * have created it between our lookup
         * and insert.
         */
        if (
          partnerCreateError.code !==
          "23505"
        ) {
          throw partnerCreateError;
        }
      }
    } else if (
      existingPartner.status !==
      "active"
    ) {
      const {
        error:
          partnerActivateError,
      } = await admin
        .from(
          "realtor_partners"
        )
        .update({
          brokerage_name:
            brokerageName,
          license_state:
            licenseState,
          status:
            "active",
          updated_at:
            now,
        })
        .eq(
          "id",
          existingPartner.id
        )
        .eq(
          "user_id",
          user.id
        );

      if (
        partnerActivateError
      ) {
        throw partnerActivateError;
      }
    }

    const {
      error: profileError,
    } = await admin
      .from("profiles")
      .upsert({
        id:
          user.id,
        full_name:
          fullName,
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

    /*
     * Canonicalize account metadata only
     * after server-side Realtor enrollment
     * succeeds.
     */
    const {
      error:
        authMetadataError,
    } =
      await admin.auth.admin
        .updateUserById(
          user.id,
          {
            user_metadata: {
              ...metadata,
              account_role:
                "realtor",
              onboarding_mode:
                "realtor",
              platform_access:
                "realtor",
              realtor_public_signup:
                true,
              brokerage_name:
                brokerageName ??
                undefined,
              license_state:
                licenseState ??
                undefined,
            },
          }
        );

    if (authMetadataError) {
      console.warn(
        "[realtor-register] metadata update failed:",
        authMetadataError
      );
    }

    return NextResponse.json({
      success: true,
      redirectTo:
        "/realtor",
    });
  } catch (error) {
    console.error(
      "[realtor-register] failed:",
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
