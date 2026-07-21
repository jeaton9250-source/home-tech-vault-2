import { NextResponse } from "next/server";

import { buildDeletionPreview } from "@/lib/account-admin/validation";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const admin = createAdminClient();

    const preview = await buildDeletionPreview(
      admin,
      id,
      session.userId
    );

    if (!preview) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ preview });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin deletion preview error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load deletion preview.",
      },
      { status: 500 }
    );
  }
}
