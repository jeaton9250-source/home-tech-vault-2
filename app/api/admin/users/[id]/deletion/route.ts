import { NextResponse } from "next/server";

import {
  createDeletionJob,
  getLatestDeletionJob,
} from "@/lib/account-admin/deletion";
import { isDestructiveActionRateLimited } from "@/lib/account-admin/rateLimit";
import { DELETION_REASONS } from "@/lib/account-admin/constants";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DeletionPostBody = {
  reason?: string;
  notes?: string;
  emailConfirmation?: string;
  transferOwnerUserId?: string | null;
  deleteHouseholdData?: boolean;
  confirmIrreversible?: boolean;
};

const VALID_REASON_IDS = new Set(
  DELETION_REASONS.map((entry) => entry.id)
);

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requirePlatformAdminSession();

    const { id } = await context.params;
    const admin = createAdminClient();

    const job = await getLatestDeletionJob(
      admin,
      id
    );

    return NextResponse.json({ job });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin deletion job lookup error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load deletion job status.",
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
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const body =
      (await request.json()) as DeletionPostBody;

    if (body.confirmIrreversible !== true) {
      return NextResponse.json(
        {
          error:
            "Irreversible confirmation is required for permanent deletion.",
        },
        { status: 400 }
      );
    }

    const reason = body.reason?.trim();

    if (!reason || !VALID_REASON_IDS.has(reason as never)) {
      return NextResponse.json(
        {
          error:
            "A valid deletion reason is required.",
        },
        { status: 400 }
      );
    }

    const emailConfirmation =
      body.emailConfirmation?.trim();

    if (!emailConfirmation) {
      return NextResponse.json(
        {
          error:
            "Email confirmation is required.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    if (
      await isDestructiveActionRateLimited(
        admin,
        session.userId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Too many deletion requests. Try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    const result = await createDeletionJob(
      admin,
      {
        targetUserId: id,
        actorId: session.userId,
        reason,
        notes: body.notes ?? null,
        emailConfirmation,
        transferOwnerUserId:
          body.transferOwnerUserId ?? null,
        deleteHouseholdData:
          body.deleteHouseholdData === true,
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.message,
          code: result.code,
          preview: result.preview ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      job: result.job,
      preview: result.preview,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin deletion request error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create deletion job.",
      },
      { status: 500 }
    );
  }
}
