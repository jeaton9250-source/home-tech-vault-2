import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildEnrollmentPreview,
  enrollFoundingMember,
  FoundingMemberValidationError,
} from "@/lib/founding-members/enrollment";

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

    const preview = await buildEnrollmentPreview(
      admin,
      userId
    );

    return NextResponse.json({ preview });
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

    return NextResponse.json(
      {
        error:
          "Unable to load enrollment preview.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession(request);
    const { userId } = await context.params;
    const body =
      (await request.json()) as {
        confirm?: boolean;
        notes?: string | null;
      };

    const admin = createAdminClient();
    const result = await enrollFoundingMember(
      admin,
      {
        targetUserId: userId,
        actorId: session.userId,
        confirm: body.confirm === true,
        notes: body.notes,
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
      "Founding member enrollment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to enroll founding member.",
      },
      { status: 500 }
    );
  }
}
