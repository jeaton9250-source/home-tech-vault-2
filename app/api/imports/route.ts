import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabaseServerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            // Safe to ignore when cookies cannot be mutated.
          }
        },
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase =
      createSupabaseServerClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const url = new URL(request.url);
    const countOnly =
      url.searchParams.get("count") === "1";

    if (countOnly) {
      const { count, error } = await supabase
        .from("device_imports")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error(
          "Unable to count imports:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Unable to load your Smart Imports.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        count: count ?? 0,
      });
    }

    const { data, error } = await supabase
      .from("device_imports")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Unable to load imports:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to load your Smart Imports.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      imports: data ?? [],
    });
  } catch (error) {
    console.error(
      "Import list error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading imports.",
      },
      {
        status: 500,
      }
    );
  }
}