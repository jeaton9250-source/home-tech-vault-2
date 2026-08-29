import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const {
      id,
    } = await context.params;

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } = await admin
      .from("realtor_vault_gifts")
      .select("*")
      .eq(
        "id",
        id
      )
      .eq(
        "realtor_user_id",
        user.id
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Client Vault not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      gift: data,
    });
  } catch (error) {
    console.error(
      "[realtor/gifts/:id] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load this client Vault.",
      },
      {
        status: 500,
      }
    );
  }
}
