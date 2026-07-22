import {
  Activity,
  Cpu,
  Home,
  Mail,
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
    id: "devices",
    href: "/admin/analytics",
    label: "Devices",
    icon: Cpu,
    description: "Inventory totals in reports",
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
