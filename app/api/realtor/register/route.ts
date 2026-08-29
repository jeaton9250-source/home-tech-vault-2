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
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function normalizeEmail(
  value: string | null | undefined
) {
  return value
    ?.trim()
    .toLowerCase() ?? "";
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

    const admin =
      createAdminClient();

    const [
      profileResult,
      partnerResult,
      enrollmentResult,
    ] = await Promise.all([
      admin
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle(),

      admin
        .from(
          "realtor_partners"
        )
        .select(
          "id, status"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),

      admin
        .from(
          "realtor_enrollments"
        )
        .select(
          `
            id,
            user_id,
            email,
            first_name,
            last_name,
            brokerage_name,
            license_state,
            status
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (partnerResult.error) {
      throw partnerResult.error;
    }

    if (enrollmentResult.error) {
      throw enrollmentResult.error;
    }

    const profile =
      profileResult.data;

    const existingPartner =
      partnerResult.data;

    const enrollment =
      enrollmentResult.data;

    /*
     * Platform administrators retain their
     * normal account model.
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

    /*
     * If the account does not already possess
     * a server-created Realtor partner record,
     * require server-controlled public Realtor
     * enrollment evidence.
     *
     * user_metadata is NOT authorization.
     */
    if (!existingPartner) {
      if (!enrollment) {
        return NextResponse.json(
          {
            error:
              "This account does not have a valid Realtor enrollment.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        !["pending", "completed"].includes(
          enrollment.status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "This Realtor enrollment is no longer active.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        normalizeEmail(
          enrollment.email
        ) !==
        normalizeEmail(
          user.email
        )
      ) {
        return NextResponse.json(
          {
            error:
              "The Realtor enrollment email does not match this account.",
          },
          {
            status: 403,
          }
        );
      }

      /*
       * Public Realtor accounts must remain
       * separate from an existing Personal Vault.
       */
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
    }

    /*
     * For public enrollment, profile/business
     * information comes from the protected
     * enrollment record.
     *
     * Existing server-created Realtor partners
     * may come from the admin invitation flow,
     * where user_metadata remains display data,
     * not authorization.
     */
    const metadata =
      (user.user_metadata ??
        {}) as Record<
        string,
        unknown
      >;

    const firstName =
      cleanText(
        enrollment?.first_name ??
          metadata.first_name,
        80
      );

    const lastName =
      cleanText(
        enrollment?.last_name ??
          metadata.last_name,
        80
      );

    const fullName =
      [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      cleanText(
        metadata.full_name,
        160
      ) ||
      user.email ||
      "Realtor";

    const brokerageName =
      cleanText(
        enrollment?.brokerage_name ??
          metadata.brokerage_name,
        160
      ) || null;

    const licenseState =
      cleanText(
        enrollment?.license_state ??
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
         * Concurrent setup requests may race.
         * Unique user_id protection makes the
         * operation idempotent.
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
     * Only the trusted server canonicalizes
     * Realtor metadata after authorization
     * has succeeded.
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
              first_name:
                firstName ||
                undefined,
              last_name:
                lastName ||
                undefined,
              full_name:
                fullName,
              brokerage_name:
                brokerageName ??
                undefined,
              license_state:
                licenseState ??
                undefined,
              account_role:
                "realtor",
              onboarding_mode:
                "realtor",
              platform_access:
                "realtor",
              realtor_public_signup:
                Boolean(
                  enrollment
                ),
            },
          }
        );

    if (authMetadataError) {
      console.warn(
        "[realtor-register] metadata update failed:",
        authMetadataError
      );
    }

    if (enrollment) {
      const {
        error:
          enrollmentUpdateError,
      } = await admin
        .from(
          "realtor_enrollments"
        )
        .update({
          status:
            "completed",
          completed_at:
            now,
          updated_at:
            now,
        })
        .eq(
          "user_id",
          user.id
        );

      if (
        enrollmentUpdateError
      ) {
        /*
         * realtor_partners is authoritative once
         * successfully created, so don't break
         * the account over bookkeeping failure.
         */
        console.warn(
          "[realtor-register] enrollment completion update failed:",
          enrollmentUpdateError
        );
      }
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
