import {
  randomUUID,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

function normalizeEmail(
  value: unknown
) {
  return cleanText(
    value,
    254
  ).toLowerCase();
}

function buildFullName(
  firstName: string,
  lastName: string
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildReferralCode() {
  return `HTV-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

export async function POST(
  request: Request
) {
  try {
    const session =
      await requirePlatformAdminSession(
        request
      );

    const body =
      (await request.json()) as {
        email?: string;
        firstName?: string;
        lastName?: string;
        brokerageName?: string;
        licenseState?: string;
      };

    const email =
      normalizeEmail(
        body.email
      );

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

    const brokerageName =
      cleanText(
        body.brokerageName,
        160
      );

    const licenseState =
      cleanText(
        body.licenseState,
        40
      ).toUpperCase();

    if (
      !email ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          error:
            "Enter the Realtor's first and last name.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      createAdminClient();

    /*
     * Realtor-only accounts are intentionally separate
     * from homeowner household accounts.
     */
    const {
      data:
        existingPartner,
      error:
        existingPartnerError,
    } = await admin
      .from(
        "realtor_partners"
      )
      .select(
        "id, user_id, status"
      )
      .eq(
        "user_id",
        session.userId
      )
      .maybeSingle();

    if (
      existingPartnerError
    ) {
      /*
       * This lookup is only defensive. It should not stop
       * invitations merely because the inviting admin is
       * also a Realtor partner.
       */
      console.warn(
        "[realtor-invite] inviter partner lookup:",
        existingPartnerError
      );
    }

    const origin =
      new URL(
        request.url
      ).origin;

    const redirectTo =
      `${origin}/auth/confirm?next=${encodeURIComponent(
        "/invite/setup"
      )}`;

    const fullName =
      buildFullName(
        firstName,
        lastName
      );

    const {
      data,
      error: inviteError,
    } =
      await admin.auth.admin
        .inviteUserByEmail(
          email,
          {
            redirectTo,
            data: {
              first_name:
                firstName,
              last_name:
                lastName,
              full_name:
                fullName,

              /*
               * These values control the special
               * Realtor setup path.
               */
              account_role:
                "realtor",
              onboarding_mode:
                "realtor",
              platform_access:
                "realtor",

              brokerage_name:
                brokerageName ||
                undefined,

              license_state:
                licenseState ||
                undefined,

              invited_by_platform_admin:
                session.userId,
            },
          }
        );

    if (
      inviteError ||
      !data.user
    ) {
      const message =
        inviteError?.message ??
        "Unable to send the Realtor invitation.";

      const normalized =
        message.toLowerCase();

      if (
        normalized.includes(
          "already"
        ) ||
        normalized.includes(
          "registered"
        ) ||
        normalized.includes(
          "exists"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "A Home Tech Vault account already exists for this email.",
          },
          {
            status: 409,
          }
        );
      }

      console.error(
        "[realtor-invite] Supabase invite failed:",
        inviteError
      );

      return NextResponse.json(
        {
          error: message,
        },
        {
          status:
            inviteError?.status ||
            500,
        }
      );
    }

    /*
     * The partner row is created inactive.
     *
     * The invitee becomes active only after they set
     * their password and finish Realtor setup.
     */
    const {
      error: partnerError,
    } = await admin
      .from(
        "realtor_partners"
      )
      .insert({
        user_id:
          data.user.id,

        brokerage_name:
          brokerageName ||
          null,

        license_state:
          licenseState ||
          null,

        referral_code:
          buildReferralCode(),

        status:
          "inactive",
      });

    if (partnerError) {
      console.error(
        "[realtor-invite] partner creation failed:",
        partnerError
      );

      /*
       * Do not leave behind an invited Auth account if
       * the Realtor authorization record could not be made.
       */
      await admin.auth.admin
        .deleteUser(
          data.user.id
        )
        .catch(
          (cleanupError) => {
            console.error(
              "[realtor-invite] auth cleanup failed:",
              cleanupError
            );
          }
        );

      return NextResponse.json(
        {
          error:
            "The Realtor invitation could not be completed.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        `Realtor invitation sent to ${email}.`,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(
        error
      );

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "[realtor-invite] unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to invite this Realtor.",
      },
      {
        status: 500,
      }
    );
  }
}
