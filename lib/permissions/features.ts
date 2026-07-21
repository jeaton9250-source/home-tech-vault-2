import type {
  FeatureKey,
  FeaturePlanRequirement,
} from "@/lib/permissions/types";

export const FEATURE_REQUIREMENTS: Record<
  FeatureKey,
  FeaturePlanRequirement
> = {
  dashboard: "free",
  devices: "free",
  deviceDetails: "free",
  documents: "free",
  warranties: "free",
  maintenance: "free",
  network: "free",
  subscriptions: "free",
  settings: "free",
  account: "free",
  notifications: "free",
  security: "free",
  audit: "free",

  networkDiscover: "pro",
  rooms: "pro",
  reports: "pro",
  insights: "pro",
  aiAdvisor: "pro",

  family: "family",
  billing: "free",
};

export const FEATURE_LABELS: Record<
  FeatureKey,
  string
> = {
  dashboard: "Dashboard",
  devices: "Devices",
  deviceDetails: "Device Details",
  documents: "Documents",
  warranties: "Warranties",
  maintenance: "Maintenance",
  network: "Network",
  networkDiscover: "Network Discovery",
  rooms: "Rooms",
  subscriptions: "Subscriptions",
  reports: "Reports",
  insights: "Insights",
  aiAdvisor: "AI Advisor",
  family: "Family Sharing",
  settings: "Settings",
  account: "Account",
  notifications: "Notifications",
  security: "Security",
  audit: "Audit",
  billing: "Billing",
};
