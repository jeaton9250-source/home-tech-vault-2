import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Laptop,
  MessageSquare,
  Network,
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
  NavMenuGroup,
  QuickAddItem,
} from "@/lib/navigation/types";

export const PRIMARY_NAV_GROUPS: NavMenuGroup[] =
  [
    {
      id: "overview",
      label: "Home Pulse",
      href: "/dashboard",
    },
    {
      id: "technology",
      label: "Technology",
      items: [
        {
          label: "Devices",
          href: "/devices",
          icon: Laptop,
          description:
            "Inventory and device records",
          feature: "devices",
        },
        {
          label: "Rooms",
          href: "/home",
          icon: Building2,
          description:
            "Organize by room",
          feature: "rooms",
        },
        {
          label: "Warranties",
          href: "/warranties",
          icon: Shield,
          description:
            "Coverage and expiration dates",
          feature: "warranties",
        },
        {
          label: "Maintenance",
          href: "/maintenance",
          icon: Wrench,
          description:
            "Tasks and service history",
          feature: "maintenance",
        },
      ],
    },
    {
      id: "digitalVault",
      label: "Digital Vault",
      items: [
        {
          label: "Documents",
          href: "/documents",
          icon: FileText,
          description:
            "Receipts, manuals, and files",
          feature: "documents",
        },
        {
          label: "Upload Document",
          href: "/documents/upload",
          icon: Upload,
          description:
            "Add a new vault document",
          feature: "documents",
        },
        {
          label: "Subscriptions",
          href: "/subscriptions",
          icon: CreditCard,
          description:
            "Streaming and service costs",
          feature: "subscriptions",
        },
      ],
    },
    {
      id: "network",
      label: "Network",
      items: [
        {
          label: "Your Network",
          href: "/network",
          icon: Network,
          description:
            "ISP, router, and Wi‑Fi details",
          feature: "network",
        },
        {
          label: "Discover Devices",
          href: "/network/discover",
          icon: Radar,
          description:
            "Scan and import network devices",
          feature: "networkDiscover",
        },
        {
          label: "Edit Network",
          href: "/network/edit",
          icon: Settings,
          description:
            "Update network information",
          feature: "network",
        },
      ],
    },
    {
      id: "insights",
      label: "Insights",
      items: [
        {
          label: "Reports",
          href: "/reports",
          icon: BarChart3,
          description:
            "Household technology reports",
          feature: "reports",
        },
        {
          label: "Insights",
          href: "/insights",
          icon: Sparkles,
          description:
            "Recommendations and trends",
          feature: "insights",
        },
        {
          label: "Audit Log",
          href: "/audit",
          icon: Shield,
          description:
            "Vault health and completeness",
          feature: "audit",
        },
      ],
    },
    {
      id: "family",
      label: "Family",
      items: [
        {
          label: "Household",
          href: "/family",
          icon: Users,
          description:
            "Members, roles, and invites",
          feature: "family",
        },
        {
          label: "Account",
          href: "/account",
          icon: User,
          description:
            "Profile and plan summary",
          feature: "account",
        },
        {
          label: "Profile",
          href: "/profile",
          icon: User,
          description:
            "Personal profile settings",
          feature: "account",
        },
      ],
    },
    {
      id: "more",
      label: "More",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          description:
            "Alerts and activity center",
          feature: "notifications",
        },
        {
          label: "Security",
          href: "/security",
          icon: Shield,
          description:
            "Account security and recovery",
          feature: "securityCenter",
        },
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          description:
            "Application preferences",
          feature: "settings",
        },
        {
          label: "Billing",
          href: "/settings/billing",
          icon: CreditCard,
          description:
            "Subscription and payments",
          feature: "billing",
        },
        {
          label: "Contact",
          href: "/contact",
          icon: MessageSquare,
          description:
            "Support and feedback",
          feature: "settings",
        },
      ],
    },
  ];

export const QUICK_ADD_ITEMS: QuickAddItem[] =
  [
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
      label: "Add Maintenance Task",
      href: "/maintenance/new",
      icon: Wrench,
      description:
        "Schedule service or upkeep",
      feature: "maintenance",
      actionFeature: "maintenance",
    },
    {
      label: "Add Subscription",
      href: "/subscriptions/add",
      icon: CreditCard,
      description:
        "Track a recurring service",
      feature: "subscriptions",
      actionFeature: "subscriptions",
    },
  ];
