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
  effectivePlan: string;
  subscriptionStatus: string;
  isPlatformAdmin: boolean;
  accountStatus: "active" | "deactivated";
  householdId: string | null;
  householdName: string | null;
  householdRole: string | null;
  onboardingCompleted: boolean;
  deviceCount: number;
  documentCount: number;
  supportTicketCount: number;
  hasConnector: boolean;
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
  deactivatedAt: string | null;
  deactivationReason: string | null;
  ownedHouseholdId: string | null;
  ownedHouseholdName: string | null;
  ownedHouseholdMemberCount: number;
  deletionJobId: string | null;
  deletionJobStatus: string | null;
  deletionJobStep: string | null;
  deletionJobError: string | null;
  deletionJobSafeErrorCode: string | null;
  deletionJobUpdatedAt: string | null;
  deletionJobStartedAt: string | null;
  deletionJobCanRetry: boolean;
  deletionJobCanCancel: boolean;
  deletionJobIsStale: boolean;
  deletionJobMessage: string | null;
  foundingMemberNumber: number | null;
  foundingMemberStatus: "active" | "removed" | null;
  foundingMemberEnrolledAt: string | null;
  foundingMemberBenefitMode: string | null;
  foundingMemberPlanGrantId: string | null;
  warrantyCount: number;
  maintenanceTaskCount: number;
  hasConnectorInstalled: boolean;
  connectorVersion: string | null;
  recentActivity: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
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
  connectorCount: number;
};

export type AdminHouseholdDetail = AdminHouseholdSummary & {
  members: Array<{
    userId: string;
    email: string | null;
    fullName: string | null;
    role: string;
    joinedAt: string | null;
  }>;
  connectors: Array<{
    id: string;
    name: string;
    platform: string | null;
    appVersion: string | null;
    status: string | null;
    lastSeenAt: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    createdAt: string;
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


export type AdminVercelTrafficRow = {
  label: string;
  visitors: number;
  pageviews: number;
};

export type AdminVercelDailyTraffic = {
  date: string;
  visitors: number;
  pageviews: number;
};

export type AdminVercelAnalyticsSnapshot = {
  configured: boolean;
  available: boolean;
  error: string | null;
  since: string;
  until: string;
  visitors: number;
  pageviews: number;
  topPages: AdminVercelTrafficRow[];
  topReferrers: AdminVercelTrafficRow[];
  dailyTraffic: AdminVercelDailyTraffic[];
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

export type AdminHouseholdInviteRole =
  | "admin"
  | "member"
  | "viewer";

export type AdminInvitationType =
  | "create_account"
  | "join_household";

export type AdminPendingInvitation = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  invitationType: AdminInvitationType;
  householdId: string | null;
  householdName: string | null;
  role: AdminHouseholdInviteRole | null;
  invitedBy: string | null;
  invitedByName: string | null;
  invitedByEmail: string | null;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "expired";
};

export type AdminInviteUserInput = {
  invitationType: AdminInvitationType;
  email: string;
  householdId?: string | null;
  role?: AdminHouseholdInviteRole | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type AdminDeviceOnlineStatus =
  | "online"
  | "offline"
  | "unknown";

export type AdminDeviceWarrantyStatus =
  | "active"
  | "expiring"
  | "expired"
  | "missing";

export type AdminDeviceSummary = {
  id: string;
  deviceName: string | null;
  brand: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  category: string | null;
  photoUrl: string | null;
  householdId: string | null;
  householdName: string | null;
  householdOwnerId: string | null;
  householdOwnerName: string | null;
  householdOwnerEmail: string | null;
  onlineStatus: AdminDeviceOnlineStatus;
  lastSeenAt: string | null;
  warrantyDate: string | null;
  warrantyStatus: AdminDeviceWarrantyStatus;
  documentCount: number;
  createdAt: string | null;
};

export type AdminDeviceDetail = AdminDeviceSummary & {
  purchaseDate: string | null;
  purchasePrice: number | null;
  location: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  manufacturer: string | null;
  discoverySource: string | null;
  firstSeenAt: string | null;
  networkUpdatedAt: string | null;
  photoCount: number;
  maintenanceCount: number;
};

export type AdminDeviceListSummary = {
  totalDevices: number;
  online: number;
  offline: number;
  unknown: number;
  expiringWarranties: number;
  scope: "filtered" | "platform";
};

export type AdminDeviceSortOption =
  | "newest"
  | "oldest"
  | "name"
  | "household"
  | "last_seen"
  | "warranty";
