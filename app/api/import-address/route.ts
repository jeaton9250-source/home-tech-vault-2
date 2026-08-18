import {
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@supabase/ssr";

import {
  cookies,
} from "next/headers";

import {
  ensureReceiptAddress,
} from "@/lib/import/receiptAddress";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export async function GET() {
  try {
    const cookieStore =
      await cookies();

    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll(
              cookiesToSet
            ) {
              try {
                cookiesToSet.forEach(
                  ({
                    name,
                    value,
                    options,
                  }) => {
                    cookieStore.set(
                      name,
                      value,
                      options
                    );
                  }
                );
              } catch {
                /*
                  Safe to ignore here.
                */
              }
            },
          },
        }
      );

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
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          error:
            "Account email unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      ------------------------------------------------
      FIND CANONICAL HOUSEHOLD
      ------------------------------------------------

      Do not derive household ownership from devices.

      A brand-new user usually has zero devices, which
      previously caused Smart Import to lose household
      context on exactly the accounts that need it most.

      Authentication above is still performed using the
      signed-in user's session. Database provisioning below
      uses the server-only admin client.
    */
    const admin =
      createAdminClient();

    let householdId:
      | string
      | null = null;

    /*
      Prefer the user's explicit household membership.
    */
    const {
      data: membership,
      error: membershipError,
    } = await admin
      .from("household_members")
      .select(
        "household_id, role"
      )
      .eq(
        "user_id",
        user.id
      )
      .order(
        "joined_at",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Smart Import household membership lookup failed:",
        membershipError
      );
    }

    if (membership?.household_id) {
      householdId =
        membership.household_id;
    }

    /*
      Legacy/fallback path:
      if membership creation somehow has not completed yet,
      check whether the user owns a canonical household.
    */
    if (!householdId) {
      const {
        data: ownedHousehold,
        error: ownedHouseholdError,
      } = await admin
        .from("households")
        .select("id")
        .eq(
          "owner_id",
          user.id
        )
        .limit(1)
        .maybeSingle();

      if (ownedHouseholdError) {
        console.error(
          "Smart Import owned household lookup failed:",
          ownedHouseholdError
        );
      }

      householdId =
        ownedHousehold?.id ??
        null;
    }

    /*
      ------------------------------------------------
      FIND THE USER'S REAL NAME
      ------------------------------------------------

      Start with Supabase auth metadata.
    */
    const metadata =
      user.user_metadata ??
      {};

    const metadataFirstName =
      typeof metadata.first_name ===
      "string"
        ? metadata.first_name.trim()
        : "";

    const metadataLastName =
      typeof metadata.last_name ===
      "string"
        ? metadata.last_name.trim()
        : "";

    const metadataFullName =
      typeof metadata.full_name ===
      "string"
        ? metadata.full_name.trim()
        : "";

    const metadataName =
      typeof metadata.name ===
      "string"
        ? metadata.name.trim()
        : "";

    /*
      Try a profiles table if your app
      has one.

      This does NOT break anything if
      the table doesn't exist or if the
      user doesn't have a profile row.
    */
    let profileFullName:
      | string
      | null = null;

    try {
      const {
        data: profile,
      } = await admin
        .from("profiles")
        .select(
          "first_name, last_name, full_name"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();

      if (profile) {
        const firstName =
          typeof profile.first_name ===
          "string"
            ? profile.first_name.trim()
            : "";

        const lastName =
          typeof profile.last_name ===
          "string"
            ? profile.last_name.trim()
            : "";

        const fullName =
          typeof profile.full_name ===
          "string"
            ? profile.full_name.trim()
            : "";

        if (fullName) {
          profileFullName =
            fullName;
        } else {
          const combined =
            [
              firstName,
              lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

          if (combined) {
            profileFullName =
              combined;
          }
        }
      }
    } catch (profileError) {
      /*
        Ignore profile lookup issues.

        We'll simply fall back to
        auth metadata or account email.
      */
      console.log(
        "Profile name lookup skipped:",
        profileError
      );
    }

    /*
      Pick the best available name.

      Priority:

      1. profiles.full_name
      2. profiles first + last
      3. auth full_name
      4. auth first + last
      5. auth name
      6. login email fallback
    */
    const metadataCombinedName =
      [
        metadataFirstName,
        metadataLastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const fullName =
      profileFullName ||
      metadataFullName ||
      metadataCombinedName ||
      metadataName ||
      null;

    /*
      ------------------------------------------------
      CREATE OR RETURN SMART IMPORT ADDRESS
      ------------------------------------------------
    */
    const result =
      await ensureReceiptAddress({
        supabase: admin,

        userId:
          user.id,

        householdId,

        fullName,

        accountEmail:
          user.email,
      });

    return NextResponse.json({
      emailAddress:
        result.emailAddress,

      token:
        result.token,

      domain:
        process.env
          .SMART_IMPORT_DOMAIN ||
        "fuevwun.resend.app",

      generatedFrom:
        fullName
          ? "profile-name"
          : "account-email",
    });
  } catch (error) {
    console.error(
      "Import address error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create Smart Import address.",
      },
      {
        status: 500,
      }
    );
  }
}