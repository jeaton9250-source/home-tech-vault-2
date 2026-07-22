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

export type PrimaryNavItem = {
  label: string;
  href: string;
  feature?: FeatureKey;
  /** Path prefixes that should highlight this nav item */
  activePrefixes?: string[];
};

export type ProfileNavItem = NavMenuItem & {
  /** Hide unless the user can manage billing */
  requiresBillingAccess?: boolean;
  /** Show only for verified platform admins */
  adminOnly?: boolean;
};

export type QuickAddItem = NavMenuItem & {
  actionFeature?: FeatureKey;
};
