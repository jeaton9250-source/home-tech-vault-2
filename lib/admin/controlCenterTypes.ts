import type { AdminPendingInvitation } from "@/lib/admin/types";

export type AdminActivityEvent = {
  id: string;
  kind:
    | "user_created"
    | "invitation_sent"
    | "invitation_accepted"
    | "login"
    | "subscription_upgraded"
    | "user_suspended"
    | "user_reactivated"
    | "user_deleted"
    | "household_created"
    | "connector_installed"
    | "admin_action";
  title: string;
  description: string;
  actorLabel: string | null;
  targetLabel: string | null;
  createdAt: string;
};

export type AdminConnectorRow = {
  id: string;
  householdId: string;
  householdName: string | null;
  name: string;
  platform: string | null;
  appVersion: string | null;
  status: "online" | "idle" | "offline" | "revoked";
  lastSeenAt: string | null;
  lastScanAt: string | null;
  createdAt: string;
};

export type AdminNotificationItem = {
  id: string;
  kind:
    | "signup"
    | "upgrade"
    | "payment_failed"
    | "connector_offline"
    | "invitation_accepted";
  title: string;
  description: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type AdminUserMetrics = import("@/lib/admin/data/userMetrics").AdminUserMetrics;

export type AdminExportKind =
  | "users"
  | "households"
  | "invitations"
  | "activity";

export type AdminInvitationRow = AdminPendingInvitation;
