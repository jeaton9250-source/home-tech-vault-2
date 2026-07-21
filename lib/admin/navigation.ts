import {
  Activity,
  Award,
  CreditCard,
  Home,
  LifeBuoy,
  Mail,
  Server,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Platform Overview",
    icon: Home,
    description: "Operational summary",
  },
  {
    href: "/admin/support",
    label: "Support Inbox",
    icon: LifeBuoy,
    description: "Customer support tickets",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    description: "Account directory",
  },
  {
    href: "/admin/founding-members",
    label: "Founding Members",
    icon: Award,
    description: "First 50 member program",
  },
  {
    href: "/admin/households",
    label: "Households",
    icon: UsersRound,
    description: "Household membership",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    description: "Billing overview",
  },
  {
    href: "/admin/emails",
    label: "Email Center",
    icon: Mail,
    description: "Template catalog",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: Activity,
    description: "Product metrics",
  },
  {
    href: "/admin/system",
    label: "System Health",
    icon: Server,
    description: "Configuration checks",
  },
];
