import {
  Bell,
  CreditCard,
  HelpCircle,
  Laptop,
  LayoutDashboard,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Users,
  Wrench,
} from "lucide-react";

import type {
  PrimaryNavItem,
  ProfileNavItem,
  QuickAddItem,
} from "@/lib/navigation/types";

/** Homeowner-first primary navigation */
export const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    feature: "dashboard",
    activePrefixes: ["/dashboard"],
  },

  {
    label: "Devices",
    href: "/devices",
    feature: "devices",
    activePrefixes: ["/devices"],
  },

  /*
    Smart Import

    No feature restriction yet so every
    signed-in user can access it.
  */
  {
    label: "Smart Import",
    href: "/imports",
    icon: Sparkles,
    activePrefixes: ["/imports"],
  },

  {
    label: "Search",
    href: "/smart-search",
    icon: Search,
    activePrefixes: ["/smart-search"],
  },

  {
    label: "Network",
    href: "/network",
    icon: Radar,
    feature: "network",
    activePrefixes: ["/network"],
  },

  {
    label: "Family",
    href: "/family",
    icon: Users,
    feature: "family",
    activePrefixes: ["/family"],
  },
];

/** Account and settings destinations in the profile menu */
export const PROFILE_MENU_ITEMS: ProfileNavItem[] = [
  {
    label: "Control Center",
    href: "/admin",
    icon: LayoutDashboard,
    description:
      "Manage the Home Tech Vault platform",
    adminOnly: true,
  },

  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    feature: "settings",
  },

  {
    label: "Billing",
    href: "/settings?tab=billing",
    icon: CreditCard,
    feature: "settings",
  },

  {
    label: "Notifications",
    href: "/settings?tab=preferences",
    icon: Bell,
    feature: "settings",
  },

  {
    label: "Help",
    href: "/faq",
    icon: HelpCircle,
  },

  {
    label: "Account",
    href: "/settings?tab=profile",
    icon: User,
    feature: "account",
  },

  {
    label: "Warranties",
    href: "/warranties",
    icon: ShieldCheck,
    feature: "warranties",
  },

  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    feature: "subscriptions",
  },

  {
    label: "Reports",
    href: "/reports",
    icon: LayoutDashboard,
    feature: "reports",
  },
];

/** Additional routes preserved from former dropdowns */
export const SECONDARY_ROUTE_ITEMS: ProfileNavItem[] = [
  {
    label: "Upload Document",
    href: "/documents/upload",
    icon: Upload,
    feature: "documents",
  },

  {
    label: "Discover Devices",
    href: "/network/discover",
    icon: Radar,
    feature: "networkDiscover",
  },

  {
    label:
      "Review Connector Discovery",
    href: "/network/discovery",
    icon: Radar,
    feature: "networkDiscover",
  },

  {
    label: "Edit Network",
    href: "/network/edit",
    icon: Settings,
    feature: "network",
  },

  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    feature: "maintenance",
  },

  {
    label: "Documents",
    href: "/documents",
    icon: Upload,
    feature: "documents",
  },

  {
    label: "Network",
    href: "/network",
    icon: Radar,
    feature: "network",
  },

  {
    label: "Smart Import",
    href: "/imports",
    icon: Sparkles,
  },
];

export const QUICK_ADD_ITEMS: QuickAddItem[] = [
  {
    label: "Add Device",
    href: "/devices/add",
    icon: Laptop,
    description:
      "Record a new device",
    feature: "devices",
    actionFeature: "devices",
  },

  {
    label: "Upload Document",
    href: "/documents/upload",
    icon: Upload,
    description:
      "Attach receipts and files",
    feature: "documents",
    actionFeature: "documents",
  },

  {
    label: "Add Maintenance",
    href: "/maintenance/new",
    icon: Wrench,
    description:
      "Schedule service or upkeep",
    feature: "maintenance",
    actionFeature: "maintenance",
  },

  {
    label: "Add Warranty",
    href: "/devices/add",
    icon: ShieldCheck,
    description:
      "Record warranty coverage",
    feature: "warranties",
    actionFeature: "devices",
  },

  {
    label: "Add Subscription",
    href: "/subscriptions/add",
    icon: CreditCard,
    description:
      "Track a recurring service",
    feature: "subscriptions",
    actionFeature:
      "subscriptions",
  },
];

/**
 * Mobile sheet uses the same core
 * navigation as desktop.
 */
export const MOBILE_NAV_ITEMS: Array<
  PrimaryNavItem | ProfileNavItem
> = [...PRIMARY_NAV_ITEMS];