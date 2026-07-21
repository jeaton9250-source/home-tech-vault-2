export type FoundingMemberStatus = "active" | "removed";

export type FoundingMemberBenefitMode =
  | "linked_grant"
  | "existing_grant"
  | "paid_access"
  | "inherited_family"
  | "higher_grant";

export type FoundingProgramAvailability =
  | "open"
  | "paused"
  | "full";

export type FoundingProgramSettings = {
  programKey: string;
  enabled: boolean;
  capacity: number;
  defaultPlan: "pro" | "family";
  defaultDuration: string;
  publicMessage: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type FoundingMemberRecord = {
  id: string;
  userId: string;
  planGrantId: string | null;
  memberNumber: number;
  status: FoundingMemberStatus;
  benefitMode: FoundingMemberBenefitMode;
  enrolledAt: string;
  enrolledBy: string;
  removedAt: string | null;
  removedBy: string | null;
  removalReason: string | null;
  notes: string | null;
};

export type SafeFoundingMemberSummary = {
  isFoundingMember: boolean;
  memberNumber: number | null;
  status: FoundingMemberStatus | null;
  enrolledAt: string | null;
};

export type PublicFoundingProgramSummary = {
  programName: string;
  availability: FoundingProgramAvailability;
  capacity: number;
  enrolledCount: number;
  remainingSpots: number;
  publicMessage: string;
};

export type FoundingMemberAdminRow = {
  id: string;
  userId: string;
  memberNumber: number;
  fullName: string | null;
  email: string | null;
  enrolledAt: string;
  status: FoundingMemberStatus;
  benefitMode: FoundingMemberBenefitMode;
  effectivePlan: string;
  billingPlan: string;
  grantStatus: string | null;
  grantPlan: string | null;
  planGrantId: string | null;
};

export type FoundingMembersDashboardMetrics = {
  programStatus: FoundingProgramAvailability;
  capacity: number;
  activeCount: number;
  remainingSpots: number;
  linkedGrantCount: number;
  paidPlanCount: number;
  latestMemberNumber: number | null;
  latestEnrollmentDate: string | null;
  settings: FoundingProgramSettings;
};

export type EnrollmentPreview = {
  userId: string;
  fullName: string | null;
  email: string | null;
  personalPlan: string;
  subscriptionStatus: string;
  adminGrantPlan: string | null;
  adminGrantStatus: string | null;
  effectivePlan: string;
  effectivePlanSource: string;
  remainingSpots: number;
  expectedMemberNumber: number | null;
  programStatus: FoundingProgramAvailability;
  grantAction:
    | "create_pro_grant"
    | "reuse_pro_grant"
    | "skip_higher_access"
    | "skip_paid_access";
  grantActionDescription: string;
};

export type EnrollmentResult = {
  member: FoundingMemberRecord;
  grantId: string | null;
  grantCreated: boolean;
  grantReused: boolean;
  notification: {
    status: "sent" | "failed" | "skipped" | "no_email";
    message: string;
  };
};

export type RemovalResult = {
  member: FoundingMemberRecord;
  grantRevoked: boolean;
};
