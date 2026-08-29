import { NextResponse } from "next/server";

import { isValidEmailAddress } from "@/lib/email/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SignupBody = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  password?: unknown;
  brokerageName?: unknown;
  licenseState?: unknown;
};

function cleanText(
  value: unknown,
  maxLength = 160
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function POST(
  request: Request
) {
  let newUserId: string | null = null;

  try {
    const body =
      (await request.json()) as SignupBody;

    const firstName =
      cleanText(body.firstName, 80);

    const lastName =
      cleanText(body.lastName, 80);

    const email =
      cleanText(body.email, 254)
        .toLowerCase();

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const brokerageName =
      cleanText(
        body.brokerageName,
        160
      ) || null;

    const licenseState =
      cleanText(
        body.licenseState,
        40
      ).toUpperCase() || null;

    if (!firstName || !lastName) {
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

    if (!isValidEmailAddress(email)) {
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

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Your password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    const origin =
      new URL(request.url).origin;

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          `${origin}/auth/callback?next=${encodeURIComponent(
            "/realtors/setup"
          )}`,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name:
            `${firstName} ${lastName}`.trim(),

          /*
           * Do NOT place Realtor authorization
           * claims in user-controlled metadata.
           *
           * realtor_enrollments is now the
           * server-controlled enrollment source.
           */
        },
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }

    if (
      data.user &&
      (data.user.identities?.length ?? 0) === 0
    ) {
      return NextResponse.json(
        {
          error:
            "An account already exists for this email. Sign in instead.",
        },
        {
          status: 409,
        }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            "Unable to create your Realtor account.",
        },
        {
          status: 500,
        }
      );
    }

    newUserId = data.user.id;

    const admin =
      createAdminClient();

    const {
      error: enrollmentError,
    } = await admin
      .from("realtor_enrollments")
      .upsert(
        {
          user_id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          brokerage_name:
            brokerageName,
          license_state:
            licenseState,
          status: "pending",
          completed_at: null,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (enrollmentError) {
      console.error(
        "[realtor-signup] enrollment creation failed:",
        enrollmentError
      );

      /*
       * Do not leave behind an Auth account
       * that cannot complete Realtor setup.
       */
      await admin.auth.admin
        .deleteUser(data.user.id)
        .catch(() => undefined);

      return NextResponse.json(
        {
          error:
            "Unable to prepare your Realtor account. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      sessionCreated:
        Boolean(data.session),
      requiresEmailConfirmation:
        !data.session,
    });
  } catch (error) {
    console.error(
      "[realtor-signup] failed:",
      error
    );

    /*
     * Best-effort cleanup if something failed
     * after Auth account creation.
     */
    if (newUserId) {
      try {
        const admin =
          createAdminClient();

        await admin.auth.admin
          .deleteUser(newUserId);
      } catch {
        // Do not replace the original error.
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to create your Realtor account.",
      },
      {
        status: 500,
      }
    );
  }
}
