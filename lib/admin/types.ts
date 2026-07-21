export type AdminDashboardMetrics = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeSubscriptions: number;
  freeUsers: number;
  proUsers: number;
  familyUsers: number;
  totalHouseholds: number;
  openSupportTickets: number;
  newSupportTickets: number;
  recentSignups: AdminRecentSignup[];
  recentUpgrades: AdminRecentUpgrade[];
  recentSupportActivity: AdminRecentSupportActivity[];
  systemWarnings: string[];
};

export type AdminRecentSignup = {
  id: string;
  email: string | null;
  fullName: string | null;
  createdAt: string;
};

export type AdminRecentUpgrade = {
  userId: string;
  email: string | null;
  plan: string;
  status: string;
  updatedAt: string | null;
};

export type AdminRecentSupportActivity = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
};

export type AdminUserSummary = {
  id: string;
  email: string | null;
  fullName: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  personalPlan: string;
  subscriptionStatus: string;
  isPlatformAdmin: boolean;
  householdId: string | null;
  householdRole: string | null;
  deviceCount: number;
  documentCount: number;
  supportTicketCount: number;
};

export type AdminUserDetail = AdminUserSummary & {
  effectivePlan: string;
  effectivePlanSource: string;
  inheritedHouseholdPlan: string | null;
  hasActiveAdminGrant: boolean;
  adminGrantPlan: string | null;
  adminGrantStatus: string | null;
  adminGrantExpiresAt: string | null;
  adminGrantReason: string | null;
  adminGrantNotes: string | null;
  adminGrantId: string | null;
  householdName: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

export type AdminHouseholdSummary = {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  memberCount: number;
  inheritedPlan: string;
  createdAt: string;
  deviceCount: number;
  documentCount: number;
  openSupportTickets: number;
};

export type AdminHouseholdDetail = AdminHouseholdSummary & {
  members: Array<{
    userId: string;
    email: string | null;
    fullName: string | null;
    role: string;
    joinedAt: string | null;
  }>;
};

export type AdminSubscriptionRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  personalPlan: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  effectivePlan: string;
  billingSource: "personal" | "inherited_family";
  householdId: string | null;
  householdOwnerId: string | null;
};

export type AdminAnalyticsSnapshot = {
  signupsByDay: Array<{ date: string; count: number }>;
  planDistribution: Array<{ plan: string; count: number }>;
  totalUsers: number;
  totalHouseholds: number;
  totalDevices: number;
  totalDocuments: number;
  totalSupportTickets: number;
  openSupportTickets: number;
  familyInvitationsTotal: number;
  deferredMetrics: string[];
};

export type AdminConfigStatus =
  | "configured"
  | "missing"
  | "optional"
  | "warning";

export type AdminConfigCheck = {
  id: string;
  label: string;
  status: AdminConfigStatus;
  detail: string;
};

export type AdminSystemHealth = {
  environment: string;
  publicUrl: string;
  appVersion: string;
  checks: AdminConfigCheck[];
  supabaseConnected: boolean;
  resendConfigured: boolean;
  stripeConfigured: boolean;
};
