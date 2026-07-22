import {
  CreditCard,
  HelpCircle,
  Laptop,
  MessageSquare,
  Radar,
  Settings,
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

/** Flat desktop and mobile primary navigation */
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
  {
    label: "Documents",
    href: "/documents",
    feature: "documents",
    activePrefixes: ["/documents"],
  },
  {
    label: "Warranties",
    href: "/warranties",
    feature: "warranties",
    activePrefixes: ["/warranties"],
  },
  {
    label: "Network",
    href: "/network",
    feature: "network",
    activePrefixes: ["/network"],
  },
  {
    label: "Export",
    href: "/reports",
    feature: "reports",
    activePrefixes: ["/reports"],
  },
];

/** Secondary destinations in the avatar menu */
export const PROFILE_MENU_ITEMS: ProfileNavItem[] = [
  {
    label: "Account & Settings",
    href: "/settings",
    icon: Settings,
    feature: "settings",
  },
  {
    label: "Household",
    href: "/family",
    icon: Users,
    feature: "family",
  },
  {
    label: "Help Center",
    href: "/faq",
    icon: HelpCircle,
  },
];

/** Additional routes preserved from former dropdowns (deep links, quick add targets) */
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
    label: "Edit Network",
    href: "/network/edit",
    icon: Settings,
    feature: "network",
  },
  {
    label: "Profile",
    href: "/settings",
    icon: User,
    feature: "account",
  },
];

export const QUICK_ADD_ITEMS: QuickAddItem[] = [
  {
    label: "Add Device",
    href: "/devices/add",
    icon: Laptop,
    description: "Record a new device",
    feature: "devices",
    actionFeature: "devices",
  },
  {
    label: "Upload Document",
    href: "/documents/upload",
    icon: Upload,
    description: "Attach receipts and files",
    feature: "documents",
    actionFeature: "documents",
  },
  {
    label: "Add Maintenance Task",
    href: "/maintenance/new",
    icon: Wrench,
    description: "Schedule service or upkeep",
    feature: "maintenance",
    actionFeature: "maintenance",
  },
  {
    label: "Add Subscription",
    href: "/subscriptions/add",
    icon: CreditCard,
    description: "Track a recurring service",
    feature: "subscriptions",
    actionFeature: "subscriptions",
  },
];

/** Mobile sheet: primary links plus key secondary destinations */
export const MOBILE_NAV_ITEMS: Array<
  PrimaryNavItem | ProfileNavItem
> = [
  ...PRIMARY_NAV_ITEMS,
  {
    label: "Household",
    href: "/family",
    icon: Users,
    feature: "family",
  },
  {
    label: "Services",
    href: "/subscriptions",
    icon: CreditCard,
    feature: "subscriptions",
  },
  {
    label: "Account & Settings",
    href: "/settings",
    icon: Settings,
    feature: "settings",
  },
  {
    label: "Help Center",
    href: "/faq",
    icon: HelpCircle,
  },
  {
    label: "Contact Support",
    href: "/contact",
    icon: MessageSquare,
    feature: "settings",
  },
];
