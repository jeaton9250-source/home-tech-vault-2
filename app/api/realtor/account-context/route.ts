import {
  NextResponse,
} from "next/server";

import {
  resolveActiveClientVault,
} from "@/lib/realtor/clientVaultMode";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          authenticated: false,
          realtorOnly: false,
          clientVaultActive: false,
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
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
          "id, status"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),
    ]);

    if (
      profileResult.error
    ) {
      throw profileResult.error;
    }

    if (
      partnerResult.error
    ) {
      throw partnerResult.error;
    }

    if (
      enrollmentResult.error
    ) {
      throw enrollmentResult.error;
    }

    const isPlatformAdmin =
      profileResult.data
        ?.is_admin === true;

    const partner =
      partnerResult.data;

    const enrollment =
      enrollmentResult.data;

    const realtorEnrollmentPending =
      !partner &&
      enrollment?.status === "pending" &&
      !isPlatformAdmin;

    /*
     * Platform admins stay unrestricted even if they
     * also participate in the Realtor program.
     */
    const realtorOnly =
      Boolean(partner) &&
      !isPlatformAdmin;

    let clientVaultActive =
      false;

    if (
      realtorOnly &&
      partner?.status ===
        "active"
    ) {
      const clientVault =
        await resolveActiveClientVault(
          admin,
          user.id
        );

      clientVaultActive =
        Boolean(
          clientVault
        );
    }

    return NextResponse.json(
      {
        authenticated: true,

        realtorOnly,

        realtorStatus:
          partner?.status ??
          null,

        realtorEnrollmentPending,

        isPlatformAdmin,

        clientVaultActive,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "[realtor-account-context] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify Realtor access.",
      },
      {
        status: 500,
      }
    );
  }
}
