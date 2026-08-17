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

    /*
      Find an existing household
      from one of the user's devices.
    */
    const {
      data: existingDevice,
    } = await supabase
      .from("devices")
      .select(
        "household_id"
      )
      .eq(
        "user_id",
        user.id
      )
      .not(
        "household_id",
        "is",
        null
      )
      .limit(1)
      .maybeSingle();

    const householdId =
      existingDevice
        ?.household_id ??
      null;

    /*
      Try common Supabase profile
      metadata fields.
    */
    const metadata =
      user.user_metadata ??
      {};

    const fullName =
      metadata.full_name ??
      metadata.name ??
      (
        [
          metadata.first_name,
          metadata.last_name,
        ]
          .filter(Boolean)
          .join(" ") ||
        null
      );

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

    const result =
      await ensureReceiptAddress({
        supabase,

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