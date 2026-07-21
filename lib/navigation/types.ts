import type { LucideIcon } from "lucide-react";

import type { FeatureKey } from "@/lib/permissions/types";

export type NavGroupId =
  | "overview"
  | "technology"
  | "digitalVault"
  | "network"
  | "insights"
  | "family"
  | "more";

export type NavMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  feature?: FeatureKey;
};

export type NavMenuGroup = {
  id: NavGroupId;
  label: string;
  href?: string;
  items?: NavMenuItem[];
};

export type QuickAddItem = NavMenuItem & {
  actionFeature?: FeatureKey;
};