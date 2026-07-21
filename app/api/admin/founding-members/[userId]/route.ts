import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FoundingMemberValidationError,
} from "@/lib/founding-members/enrollment";
import { loadFoundingMemberForUser } from "@/lib/founding-members/loaders";
import {
  removeFoundingMember,
} from "@/lib/founding-members/removal";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requirePlatformAdminSession();
    const { userId } = await context.params;
    const admin = createAdminClient();

    const member =
      await loadFoundingMemberForUser(
        admin,
        userId
      );

    return NextResponse.json({ member });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    return NextResponse.json(
      { error: "Unable to load founding member." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();
    const { userId } = await context.params;
    const body =
      (await request.json()) as {
        confirm?: boolean;
        reason?: string;
        revokeLinkedGrant?: boolean;
      };

    const admin = createAdminClient();
    const result = await removeFoundingMember(
      admin,
      {
        targetUserId: userId,
        actorId: session.userId,
        confirm: body.confirm === true,
        reason: body.reason ?? "",
        revokeLinkedGrant:
          body.revokeLinkedGrant === true,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    if (
      error instanceof FoundingMemberValidationError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Founding member removal error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to remove founding member.",
      },
      { status: 500 }
    );
  }
}
