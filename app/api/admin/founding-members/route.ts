import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import {
  buildFoundingMembersCsv,
  loadFoundingMembersAdminList,
  loadFoundingMembersDashboardMetrics,
} from "@/lib/admin/data/foundingMembers";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateFoundingProgramSettings } from "@/lib/founding-members/settings";
import { FoundingProgramSettingsError } from "@/lib/founding-members/settings";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const members =
      await loadFoundingMembersAdminList({
        status:
          status === "active" ||
          status === "removed"
            ? status
            : "all",
        search: search ?? undefined,
      });

    if (format === "csv") {
      const csv = buildFoundingMembersCsv(
        members
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="founding-members.csv"',
        },
      });
    }

    const metrics =
      await loadFoundingMembersDashboardMetrics();

    return NextResponse.json({
      members,
      metrics,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Founding members list error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load founding members." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session =
      await requirePlatformAdminSession(request);
    const body =
      (await request.json()) as {
        enabled?: boolean;
        capacity?: number;
        publicMessage?: string;
        confirm?: boolean;
      };

    const settings =
      await updateFoundingProgramSettings(
        createAdminClient(),
        {
          actorId: session.userId,
          confirm: body.confirm === true,
          enabled: body.enabled,
          capacity: body.capacity,
          publicMessage: body.publicMessage,
        }
      );

    const metrics =
      await loadFoundingMembersDashboardMetrics();

    return NextResponse.json({
      settings,
      metrics,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    if (
      error instanceof FoundingProgramSettingsError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(
      "Founding members settings error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update founding members settings.",
      },
      { status: 500 }
    );
  }
}
