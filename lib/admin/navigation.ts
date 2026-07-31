"use client";

import {
  Activity,
  BarChart3,
  Cpu,
  CreditCard,
  HeartPulse,
  Home,
  LifeBuoy,
  Mail,
  Plug,
  Server,
  Sparkles,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  additionalRoutes?: string[];
};

export type AdminNavGroup = {
  id: string;
  label: string;
  description: string;
  items: AdminNavItem[];
};

export function isAdminNavItemActive(
  pathname: string,
  item: AdminNavItem
): boolean {
  const routes = [
    item.href,
    ...(item.additionalRoutes ?? []),
  ];

  return routes.some((route) =>
    route === "/admin"
      ? pathname === "/admin"
      : pathname === route ||
        pathname.startsWith(`${route}/`)
  );
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Founder dashboard and recent platform activity",
    items: [
      {
        id: "control-center",
        href: "/admin",
        label: "Control Center",
        icon: Home,
        description: "Founder overview",
      },
      {
        id: "activity",
        href: "/admin/activity",
        label: "Activity",
        icon: Activity,
        description: "Platform timeline",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    description: "Accounts, households, plans, and support",
    items: [
      {
        id: "users",
        href: "/admin/users",
        label: "Users",
        icon: Users,
        description: "Account directory",
      },
      {
        id: "households",
        href: "/admin/households",
        label: "Households",
        icon: UsersRound,
        description: "Membership and ownership",
      },
      {
        id: "subscriptions",
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: CreditCard,
        description: "Plans and billing access",
      },
      {
        id: "support",
        href: "/admin/support",
        label: "Support",
        icon: LifeBuoy,
        description: "Customer support inbox",
      },
      {
        id: "founding-members",
        href: "/admin/founding-members",
        label: "Founding Members",
        icon: Sparkles,
        description: "Founding member program",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    description: "Devices, connectors, and communications",
    items: [
      {
        id: "devices",
        href: "/admin/devices",
        label: "Devices",
        icon: Cpu,
        description: "Cross-household inventory",
      },
      {
        id: "connectors",
        href: "/admin/connectors",
        label: "Connectors",
        icon: Plug,
        description: "Installs and heartbeat health",
      },
      {
        id: "email",
        href: "/admin/emails",
        label: "Email",
        icon: Mail,
        description: "Templates and delivery",
      },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    description: "Traffic, conversion, and product reporting",
    items: [
      {
        id: "analytics",
        href: "/admin/analytics",
        label: "Analytics",
        icon: BarChart3,
        description: "Traffic and product metrics",
      },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    description: "System health and administration",
    items: [
      {
        id: "platform-tools",
        href: "/admin/platform",
        label: "Platform Tools",
        icon: Server,
        description: "Programs and system tools",
      },
      {
        id: "system-health",
        href: "/admin/system",
        label: "System Health",
        icon: HeartPulse,
        description: "Environment and integration checks",
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS =
  ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const ADMIN_APP_HOME_HREF = "/dashboard";

export function isAdminNavGroupActive(
  pathname: string,
  group: AdminNavGroup
): boolean {
  return group.items.some((item) =>
    isAdminNavItemActive(pathname, item)
  );
}

export function isAdminRoute(
  pathname: string | null | undefined
): boolean {
  return Boolean(
    pathname &&
      (pathname === "/admin" ||
        pathname.startsWith("/admin/"))
  );
}

export const ADMIN_PLATFORM_LINKS = [
  {
    href: "/admin/system",
    label: "System Health",
    description: "Environment and integration checks",
  },
  {
    href: "/admin/support",
    label: "Support Inbox",
    description: "Customer support tickets",
  },
  {
    href: "/admin/founding-members",
    label: "Founding Members",
    description: "First 50 member program",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    description: "Billing overview",
  },
] as const;
