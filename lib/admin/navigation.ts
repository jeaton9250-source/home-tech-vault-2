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
    description: "Founder command center",
    items: [
      {
        id: "control-center",
        href: "/admin",
        label: "Control Center",
        icon: Home,
        description: "Founder overview",
      },
    ],
  },

  {
    id: "growth",
    label: "Growth",
    description: "Acquisition and reporting",
    items: [
      {
        id: "analytics",
        href: "/admin/analytics",
        label: "Analytics",
        icon: BarChart3,
        description: "Traffic and product metrics",
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
    id: "customers",
    label: "Customers",
    description: "Accounts and customer operations",
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
        description: "Plans and billing",
      },
      {
        id: "support",
        href: "/admin/support",
        label: "Support",
        icon: LifeBuoy,
        description: "Customer support inbox",
      },
    ],
  },

  {
    id: "product",
    label: "Product",
    description: "Platform inventory and integrations",
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
    ],
  },

  {
    id: "operations",
    label: "Operations",
    description: "Platform administration",
    items: [
      {
        id: "activity",
        href: "/admin/activity",
        label: "Activity",
        icon: Activity,
        description: "Platform timeline",
      },
      {
        id: "email",
        href: "/admin/emails",
        label: "Email",
        icon: Mail,
        description: "Templates and delivery",
      },
      {
        id: "system-health",
        href: "/admin/system",
        label: "System Health",
        icon: HeartPulse,
        description: "Environment and integrations",
      },
      {
        id: "platform-tools",
        href: "/admin/platform",
        label: "Platform Tools",
        icon: Server,
        description: "Programs and system tools",
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS =
  ADMIN_NAV_GROUPS.flatMap(
    (group) => group.items
  );

export const ADMIN_APP_HOME_HREF =
  "/dashboard";

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
    description:
      "Environment and integration checks",
  },
  {
    href: "/admin/support",
    label: "Support Inbox",
    description:
      "Customer support tickets",
  },
  {
    href: "/admin/founding-members",
    label: "Founding Members",
    description:
      "First 50 member program",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    description:
      "Billing overview",
  },
] as const;
