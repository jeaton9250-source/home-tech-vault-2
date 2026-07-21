import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import {
  countPlatformAdmins,
  loadAdminUserDetail,
} from "@/lib/admin/data/loaders";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PlatformAdminPatchBody = {
  isAdmin?: boolean;
  confirm?: boolean;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const body =
      (await request.json()) as PlatformAdminPatchBody;

    if (body.confirm !== true) {
      return NextResponse.json(
        {
          error:
            "Confirmation is required for platform-admin changes.",
        },
        { status: 400 }
      );
    }

    if (typeof body.isAdmin !== "boolean") {
      return NextResponse.json(
        {
          error:
            "isAdmin must be provided as true or false.",
        },
        { status: 400 }
      );
    }

    const targetUser =
      await loadAdminUserDetail(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    if (
      targetUser.isPlatformAdmin &&
      body.isAdmin === false
    ) {
      const adminCount =
        await countPlatformAdmins();

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Cannot remove the last platform admin.",
          },
          { status: 400 }
        );
      }
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("profiles")
      .update({ is_admin: body.isAdmin })
      .eq("id", id);

    if (error) {
      throw error;
    }

    console.info(
      "[admin] platform-admin status changed",
      {
        actorId: session.userId,
        targetUserId: id,
        isAdmin: body.isAdmin,
      }
    );

    const user = await loadAdminUserDetail(id);

    return NextResponse.json({ user });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin platform-admin mutation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update platform-admin status.",
      },
      { status: 500 }
    );
  }
}
