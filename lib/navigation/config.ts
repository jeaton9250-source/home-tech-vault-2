import {
  Bell,
  Building2,
  CreditCard,
  HelpCircle,
  Laptop,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Radar,
  Settings,
  Shield,
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
    label: "Rooms",
    href: "/home",
    icon: Building2,
    feature: "rooms",
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    feature: "maintenance",
  },
  {
    label: "Insights",
    href: "/insights",
    icon: Sparkles,
    feature: "insights",
  },
  {
    label: "Audit Log",
    href: "/audit",
    icon: Shield,
    feature: "audit",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    feature: "notifications",
  },
  {
    label: "Security",
    href: "/security",
    icon: Shield,
    feature: "securityCenter",
  },
  {
    label: "Account",
    href: "/account",
    icon: User,
    feature: "account",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    feature: "settings",
  },
  {
    label: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    feature: "billing",
    requiresBillingAccess: true,
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
  {
    label: "Platform Overview",
    href: "/admin",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    label: "Support Inbox",
    href: "/admin/support",
    icon: LifeBuoy,
    adminOnly: true,
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
    href: "/profile",
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
    label: "Settings",
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
