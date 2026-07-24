import type { AdminUserSummary } from "@/lib/admin/types";

export type AdminUserDisplayStatus =
  | "active"
  | "invited"
  | "never_logged_in"
  | "suspended";

export function resolveUserDisplayStatus(
  user: Pick<
    AdminUserSummary,
    "accountStatus" | "lastSignInAt"
  >
): AdminUserDisplayStatus {
  if (user.accountStatus === "deactivated") {
    return "suspended";
  }

  if (!user.lastSignInAt) {
    return "never_logged_in";
  }

  return "active";
}

export const USER_STATUS_LABELS: Record<
  AdminUserDisplayStatus,
  string
> = {
  active: "Active",
  invited: "Invited",
  never_logged_in: "Never Logged In",
  suspended: "Suspended",
};
