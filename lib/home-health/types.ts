export type HomeHealthStatusLabel =
  | "Excellent"
  | "Healthy"
  | "Needs Attention"
  | "Needs Setup";

export type HomeHealthCardStatus =
  | "healthy"
  | "attention"
  | "incomplete";

export type HomeHealthCardKey =
  | "devices"
  | "documents"
  | "network"
  | "warranties"
  | "maintenance"
  | "subscriptions";

export type HomeHealthHighlightTone =
  | "positive"
  | "warning";

export type HomeHealthHighlight = {
  id: string;
  tone: HomeHealthHighlightTone;
  message: string;
};

export type HomeHealthRecommendation = {
  id: string;
  title: string;
  description: string;
  href: string;
  estimate: "30 seconds" | "2 minutes" | "5 minutes";
  priority: number;
};

export type HomeHealthCategoryCard = {
  key: HomeHealthCardKey;
  title: string;
  status: HomeHealthCardStatus;
  progress: number;
  summary: string;
  href: string;
};

export type HomeHealthModuleKey =
  | "devicesProtected"
  | "documentsStored"
  | "warrantyCoverage"
  | "networkConfigured"
  | "maintenanceTracking"
  | "subscriptionsOrganized"
  | "recentActivity"
  | "householdConfigured"
  | "vaultCompleteness"
  | "futureMonitoring";

export type HomeHealthDevice = {
  id: string;
  device_name: string;
  warranty_date: string | null;
  serial_number: string | null;
  purchase_date: string | null;
};

export type HomeHealthMaintenanceTask = {
  id: string;
  device_id: string | null;
  title: string | null;
  due_date: string | null;
  completed: boolean;
};

export type HomeHealthInput = {
  devices: HomeHealthDevice[];
  documentCount: number;
  subscriptionCount: number;
  monthlySubscriptionSpend: number;
  networkConfigured: boolean;
  deviceIdsWithDocuments: Set<string>;
  deviceIdsWithPhotos: Set<string>;
  deviceIdsWithMaintenance: Set<string>;
  maintenanceTasks: HomeHealthMaintenanceTask[];
  hasRecentActivity: boolean;
  householdName: string | null;
  familyMemberCount: number;
  profileHouseholdName: string | null;
};

export type HomeHealthResult = {
  isEmpty: boolean;
  score: number | null;
  monthlySubscriptionSpend: number;
  status: HomeHealthStatusLabel | null;
  statusMessage: string | null;
  moduleScores: Record<
    HomeHealthModuleKey,
    number | null
  >;
  highlights: HomeHealthHighlight[];
  recommendation: HomeHealthRecommendation | null;
  cards: HomeHealthCategoryCard[];
  vaultCompleteness: number;
};

export type HomeHealthStatus = {
  label: HomeHealthStatusLabel;
  message: string;
};
