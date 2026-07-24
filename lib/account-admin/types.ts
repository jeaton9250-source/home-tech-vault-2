export type AccountStatus = "active" | "deactivated";

export type DeletionJobStatus =
  | "pending"
  | "validating"
  | "blocked"
  | "processing"
  | "completed"
  | "failed"
  | "canceled";

export type DeletionBlockCode =
  | "TARGET_NOT_FOUND"
  | "SELF_DELETE_FORBIDDEN"
  | "LAST_PLATFORM_ADMIN"
  | "BILLING_ACTIVE"
  | "HOUSEHOLD_HAS_MEMBERS"
  | "GRANT_ISSUER_RESTRICT"
  | "ACTIVE_DELETION_JOB"
  | "TARGET_IS_PLATFORM_ADMIN";

export type DeleteStage =
  | "authorization"
  | "target_lookup"
  | "ownership_validation"
  | "auth_deletion"
  | "application_cleanup"
  | "audit_logging";

export type DeletionPreview = {
  userId: string;
  email: string | null;
  fullName: string | null;
  isPlatformAdmin: boolean;
  accountStatus: AccountStatus;
  personalPlan: string;
  subscriptionStatus: string;
  billingGrantingAccess: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  householdId: string | null;
  householdName: string | null;
  isHouseholdOwner: boolean;
  householdMemberCount: number;
  otherHouseholdMembers: Array<{
    userId: string;
    email: string | null;
    fullName: string | null;
    role: string;
  }>;
  deviceCount: number;
  documentCount: number;
  supportTicketCount: number;
  activeGrantCount: number;
  grantsIssuedCount: number;
  blockers: Array<{
    code: DeletionBlockCode;
    message: string;
  }>;
  dataToDelete: string[];
  dataPreserved: string[];
};

export type AdminAuditEventType =
  | "account_deactivated"
  | "account_reactivated"
  | "deletion_requested"
  | "deletion_blocked"
  | "deletion_started"
  | "deletion_completed"
  | "deletion_failed"
  | "deletion_canceled"
  | "deletion_retried"
  | "household_ownership_transferred"
  | "founding_program_enabled"
  | "founding_program_paused"
  | "founding_program_capacity_changed"
  | "founding_member_enrolled"
  | "founding_member_removed"
  | "founding_member_grant_revoked"
  | "founding_program_full";
