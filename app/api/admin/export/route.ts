import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import {
  buildCsv,
  csvDownloadResponse,
} from "@/lib/admin/exportCsv";
import { loadAdminActivityEvents } from "@/lib/admin/data/activity";
import { loadAdminUsers } from "@/lib/admin/data/loaders";
import { loadAdminHouseholds } from "@/lib/admin/data/loaders";
import { loadAdminPendingInvitations } from "@/lib/admin/invitations";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUserDisplayName } from "@/lib/admin/displayName";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");

    if (kind === "users") {
      const result = await loadAdminUsers({
        pagination: { page: "1", limit: "500" },
      });

      const csv = buildCsv(
        [
          "Name",
          "Email",
          "Status",
          "Plan",
          "Household",
          "Role",
          "Devices",
          "Joined",
          "Last Active",
        ],
        result.users.map((user) => [
          getAdminUserDisplayName({
            fullName: user.fullName,
            email: user.email,
          }),
          user.email,
          user.accountStatus,
          user.personalPlan,
          user.householdName,
          user.householdRole,
          user.deviceCount,
          user.createdAt,
          user.lastSignInAt,
        ])
      );

      return csvDownloadResponse("users.csv", csv);
    }

    if (kind === "households") {
      const result = await loadAdminHouseholds({
        pagination: { page: "1", limit: "500" },
      });

      const csv = buildCsv(
        [
          "Household",
          "Owner",
          "Members",
          "Devices",
          "Plan",
          "Created",
        ],
        result.households.map((household) => [
          household.name,
          household.ownerEmail,
          household.memberCount,
          household.deviceCount,
          household.inheritedPlan,
          household.createdAt,
        ])
      );

      return csvDownloadResponse(
        "households.csv",
        csv
      );
    }

    if (kind === "invitations") {
      const admin = createAdminClient();
      const invitations =
        await loadAdminPendingInvitations(admin);

      const csv = buildCsv(
        [
          "Email",
          "Type",
          "Household",
          "Role",
          "Sent",
          "Expires",
          "Status",
        ],
        invitations.map((invitation) => [
          invitation.email,
          invitation.invitationType,
          invitation.householdName,
          invitation.role,
          invitation.createdAt,
          invitation.expiresAt,
          invitation.status,
        ])
      );

      return csvDownloadResponse(
        "invitations.csv",
        csv
      );
    }

    if (kind === "activity") {
      const events = await loadAdminActivityEvents({
        limit: 500,
      });

      const csv = buildCsv(
        ["Kind", "Title", "Description", "Target", "Created"],
        events.map((event) => [
          event.kind,
          event.title,
          event.description,
          event.targetLabel,
          event.createdAt,
        ])
      );

      return csvDownloadResponse("activity.csv", csv);
    }

    return Response.json(
      { error: "Unsupported export kind." },
      { status: 400 }
    );
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Admin export error:", error);

    return Response.json(
      { error: "Unable to export data." },
      { status: 500 }
    );
  }
}
