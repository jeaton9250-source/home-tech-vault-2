import {
  Activity,
  Cpu,
  Home,
  Mail,
  Plug,
  Server,
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
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "control-center",
    href: "/admin",
    label: "Control Center",
    icon: Home,
    description: "Founder overview",
  },
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
    id: "activity",
    href: "/admin/activity",
    label: "Activity",
    icon: Activity,
    description: "Platform timeline",
  },
  {
    id: "connectors",
    href: "/admin/connectors",
    label: "Connectors",
    icon: Plug,
    description: "Heartbeat and installs",
  },
  {
    id: "devices",
    href: "/admin/devices",
    label: "Devices",
    icon: Cpu,
    description: "Cross-household inventory",
  },
  {
    id: "reports",
    href: "/admin/analytics",
    label: "Reports",
    icon: Activity,
    description: "Product metrics",
  },
  {
    id: "email",
    href: "/admin/emails",
    label: "Email",
    icon: Mail,
    description: "Templates and delivery",
  },
  {
    id: "platform",
    href: "/admin/platform",
    label: "Platform",
    icon: Server,
    description: "System tools and programs",
  },
];

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

export const ADMIN_APP_HOME_HREF = "/dashboard";

export type AdminHeaderNavItem = {
  id: string;
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

export const ADMIN_HEADER_NAV_ITEMS: AdminHeaderNavItem[] = [
  {
    id: "overview",
    href: "/admin",
    label: "Overview",
    isActive: (pathname) => pathname === "/admin",
  },
  {
    id: "users",
    href: "/admin/users",
    label: "Users",
    isActive: (pathname) =>
      pathname === "/admin/users" ||
      pathname.startsWith("/admin/users/"),
  },
  {
    id: "households",
    href: "/admin/households",
    label: "Households",
    isActive: (pathname) =>
      pathname === "/admin/households" ||
      pathname.startsWith("/admin/households/"),
  },
  {
    id: "activity",
    href: "/admin/activity",
    label: "Activity",
    isActive: (pathname) =>
      pathname === "/admin/activity" ||
      pathname.startsWith("/admin/activity/"),
  },
  {
    id: "connectors",
    href: "/admin/connectors",
    label: "Connectors",
    isActive: (pathname) =>
      pathname === "/admin/connectors" ||
      pathname.startsWith("/admin/connectors/"),
  },
  {
    id: "devices",
    href: "/admin/devices",
    label: "Devices",
    isActive: (pathname) =>
      pathname === "/admin/devices" ||
      pathname.startsWith("/admin/devices/"),
  },
  {
    id: "reports",
    href: "/admin/analytics",
    label: "Reports",
    isActive: (pathname) =>
      pathname === "/admin/analytics" ||
      pathname.startsWith("/admin/analytics/"),
  },
  {
    id: "email",
    href: "/admin/emails",
    label: "Email",
    isActive: (pathname) =>
      pathname === "/admin/emails" ||
      pathname.startsWith("/admin/emails/"),
  },
  {
    id: "platform",
    href: "/admin/platform",
    label: "Platform",
    isActive: (pathname) =>
      pathname === "/admin/platform" ||
      pathname.startsWith("/admin/platform/") ||
      pathname === "/admin/system" ||
      pathname.startsWith("/admin/system/") ||
      pathname === "/admin/support" ||
      pathname.startsWith("/admin/support/") ||
      pathname === "/admin/founding-members" ||
      pathname.startsWith("/admin/founding-members/") ||
      pathname === "/admin/subscriptions" ||
      pathname.startsWith("/admin/subscriptions/"),
  },
];

export function isAdminRoute(
  pathname: string | null | undefined
): boolean {
  if (!pathname) {
    return false;
  }

  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}
