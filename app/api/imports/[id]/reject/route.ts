import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

            setAll(cookiesToSet) {
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
                  This can happen in some
                  server-rendered contexts.
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
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const {
      data: importRecord,
      error: importError,
    } = await supabase
      .from("device_imports")
      .select(
        "id, user_id, status"
      )
      .eq("id", id)
      .eq(
        "user_id",
        user.id
      )
      .single();

    if (
      importError ||
      !importRecord
    ) {
      return NextResponse.json(
        {
          error:
            "Import not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      importRecord.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "This import has already been reviewed.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error: updateError,
    } = await supabase
      .from("device_imports")
      .update({
        status: "rejected",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq(
        "user_id",
        user.id
      );

    if (updateError) {
      console.error(
        "Unable to reject Smart Import:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to reject import.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Reject Smart Import error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error.",
      },
      {
        status: 500,
      }
    );
  }
}