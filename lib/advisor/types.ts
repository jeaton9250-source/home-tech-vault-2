export type AdvisorInsightGroup =
  | "urgent"
  | "attention"
  | "suggestion"
  | "good";

export type AdvisorInsightActionType =
  | "view_device"
  | "upload_receipt"
  | "open_warranty"
  | "schedule_maintenance"
  | "import_device"
  | "view_network"
  | "view_documents"
  | "view_subscriptions"
  | "add_device"
  | "dismiss"
  | "ask_ai";

export type AdvisorInsightAction = {
  type: AdvisorInsightActionType;
  label: string;
  href?: string;
  deviceId?: string;
  maintenanceTaskId?: string;
  discoveryId?: string;
  query?: string;
};

export type AdvisorInsight = {
  id: string;
  group: AdvisorInsightGroup;
  ruleId: string;
  title: string;
  message: string;
  priority: number;
  actions: AdvisorInsightAction[];
  metadata?: Record<string, string | number | boolean | null>;
};

export type GroupedAdvisorInsights = Record<
  AdvisorInsightGroup,
  AdvisorInsight[]
>;

export type HomeAdvisorDevice = {
  id: string;
  device_name: string;
  brand: string | null;
  location: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  online: boolean | null;
  last_seen_at: string | null;
  network_updated_at: string | null;
  first_seen_at: string | null;
  created_at: string | null;
};

export type HomeAdvisorDocument = {
  id: string;
  device_id: string | null;
  document_type: string | null;
};

export type HomeAdvisorMaintenanceTask = {
  id: string;
  device_id: string | null;
  title: string | null;
  due_date: string | null;
  completed: boolean | null;
};

export type HomeAdvisorSubscription = {
  id: string;
  service_name: string | null;
  renewal_date: string | null;
  monthly_cost: number | null;
};

export type HomeAdvisorDiscovery = {
  id: string;
  label: string;
  hostname: string | null;
  manufacturer: string | null;
  imported_device_id: string | null;
  ignored_at: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
};

export type HomeAdvisorConnector = {
  id: string;
  status: string;
  last_seen_at: string | null;
  last_scan_at: string | null;
};

export type HomeAdvisorContext = {
  userId: string;
  householdId: string | null;
  devices: HomeAdvisorDevice[];
  documents: HomeAdvisorDocument[];
  deviceIdsWithPhotos: Set<string>;
  deviceIdsWithDocuments: Set<string>;
  deviceIdsWithReceipts: Set<string>;
  maintenanceTasks: HomeAdvisorMaintenanceTask[];
  subscriptions: HomeAdvisorSubscription[];
  pendingDiscoveries: HomeAdvisorDiscovery[];
  connectors: HomeAdvisorConnector[];
  networkConfigured: boolean;
  now: Date;
};

export type HomeAdvisorResult = {
  summary: string;
  summarySource: "deterministic" | "ai";
  insights: AdvisorInsight[];
  grouped: GroupedAdvisorInsights;
  generatedAt: string;
  insightCount: number;
};
