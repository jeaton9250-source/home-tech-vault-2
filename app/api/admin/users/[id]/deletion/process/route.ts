import { NextResponse } from "next/server";

import {
  getLatestDeletionJob,
  processDeletionJob,
} from "@/lib/account-admin/deletion";
import { isDestructiveActionRateLimited } from "@/lib/account-admin/rateLimit";
import { loadAdminUserDetail } from "@/lib/admin/data/loaders";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProcessPostBody = {
  jobId?: string;
  confirm?: boolean;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requirePlatformAdminSession(request);

    const { id } = await context.params;
    const body =
      (await request.json()) as ProcessPostBody;

    if (body.confirm !== true) {
      return NextResponse.json(
        {
          error:
            "Confirmation is required to process deletion.",
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
            "Too many deletion actions. Try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    let jobId = body.jobId?.trim();

    if (!jobId) {
      const latestJob =
        await getLatestDeletionJob(
          admin,
          id
        );

      jobId = latestJob?.id;
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

    const {
      data: deletionJob,
      error: deletionJobError,
    } = await admin
      .from(
        "admin_account_deletion_jobs"
      )
      .select("target_user_id")
      .eq("id", jobId)
      .maybeSingle();

    if (deletionJobError) {
      throw deletionJobError;
    }

    if (
      !deletionJob ||
      deletionJob.target_user_id !== id
    ) {
      return NextResponse.json(
        {
          error:
            "No deletion job found for this user.",
        },
        { status: 404 }
      );
    }

    const result = await processDeletionJob(
      admin,
      jobId,
      session.userId
    );

    if (
      result.ok &&
      result.job?.status === "completed"
    ) {
      const { data: authUserData, error: authLookupError } =
        await admin.auth.admin.getUserById(id);

      const authStillExists =
        !authLookupError &&
        Boolean(authUserData.user?.id);

      if (authStillExists) {
        return NextResponse.json(
          {
            ok: false,
            deleted: false,
            stage: "auth_deletion",
            job: result.job,
            jobView: result.jobView ?? null,
            error:
              "Application cleanup finished, but the Supabase Auth user still exists. Retry deletion or repair manually.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        deleted: true,
        job: result.job,
        jobView: result.jobView ?? null,
      });
    }

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          job: result.job ?? null,
          jobView: result.jobView ?? null,
          error:
            result.message ??
            "Deletion could not be completed.",
        },
        { status: 400 }
      );
    }

    const user = await loadAdminUserDetail(id);

    return NextResponse.json({
      ok: true,
      deleted: false,
      job: result.job,
      jobView: result.jobView ?? null,
      user,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin deletion process error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process deletion job.",
      },
      { status: 500 }
    );
  }
}
