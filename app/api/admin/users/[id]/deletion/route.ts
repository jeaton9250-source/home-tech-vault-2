import { NextResponse } from "next/server";

import {
  cancelDeletionJob,
  createDeletionJob,
  getDeletionJobStatusForUser,
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
  confirmText?: string;
  transferOwnerUserId?: string | null;
  deleteHouseholdData?: boolean;
  confirmIrreversible?: boolean;
};

type DeletionDeleteBody = {
  jobId?: string;
  confirm?: boolean;
  reason?: string | null;
};

const VALID_REASON_IDS = new Set(
  DELETION_REASONS.map((entry) => entry.id)
);

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession();

    const { id } = await context.params;
    const admin = createAdminClient();

    const { job, jobView } =
      await getDeletionJobStatusForUser(
        admin,
        id,
        session.userId
      );

    return NextResponse.json({
      job,
      jobView,
    });
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
      await requirePlatformAdminSession(request);

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

    const confirmText = body.confirmText?.trim();

    if (confirmText !== "DELETE") {
      return NextResponse.json(
        {
          error:
            "Type DELETE to confirm permanent deletion.",
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
        confirmText,
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
          job: result.job ?? null,
          jobView: result.jobView ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      job: result.job,
      jobView: result.jobView,
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

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession(request);

    const { id } = await context.params;
    const body =
      (await request.json()) as DeletionDeleteBody;
    const admin = createAdminClient();

    let jobId = body.jobId?.trim();

    if (!jobId) {
      const { job } =
        await getDeletionJobStatusForUser(
          admin,
          id,
          session.userId
        );
      jobId = job?.id;
    }

    if (!jobId) {
      return NextResponse.json(
        {
          error:
            "No deletion job found for this user.",
        },
        { status: 404 }
      );
    }

    const result = await cancelDeletionJob(
      admin,
      {
        jobId,
        actorId: session.userId,
        confirm: body.confirm === true,
        reason: body.reason ?? null,
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.message ??
            "Unable to cancel deletion job.",
          job: result.job ?? null,
          jobView: result.jobView ?? null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      job: result.job,
      jobView: result.jobView,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin deletion cancel error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to cancel deletion job.",
      },
      { status: 500 }
    );
  }
}
