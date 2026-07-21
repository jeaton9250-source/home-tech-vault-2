import {
  CircleAlert,
  FileText,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import type { VaultNotification } from "@/lib/notifications/types";

export const demoNotifications: VaultNotification[] =
  [
    {
      id: "demo-warranty",
      title:
        "PlayStation 5 warranty expires in 28 days",
      description:
        "Coverage expires soon. Review the warranty before it ends.",
      timestamp: new Date().toISOString(),
      priority: "high",
      category: "warranty",
      type: "warning",
      href: "/warranties",
      actionLabel: "Review",
      dismissible: true,
      icon: ShieldCheck,
    },
    {
      id: "demo-maintenance",
      title:
        "Brother Printer maintenance is due",
      description:
        "Scheduled cleaning task is due within the next week.",
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "maintenance",
      type: "info",
      href: "/maintenance",
      actionLabel: "View Tasks",
      dismissible: true,
      icon: Wrench,
    },
    {
      id: "demo-network",
      title:
        "Two network devices are ready to review",
      description:
        "Open Network Discovery to identify and add them to your vault.",
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "network",
      type: "success",
      href: "/network/discover",
      actionLabel: "Review Scan",
      dismissible: true,
      icon: Radar,
    },
    {
      id: "demo-family",
      title: "Family invitation accepted",
      description:
        "A household member joined your shared vault.",
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "family",
      type: "success",
      href: "/family",
      actionLabel: "View Household",
      dismissible: true,
      icon: Users,
    },
    {
      id: "demo-insight",
      title:
        "Your office contains the most value",
      description:
        "The Home Office contains 62% of the household’s recorded technology value.",
      timestamp: new Date().toISOString(),
      priority: "low",
      category: "insight",
      type: "insight",
      href: "/home",
      actionLabel: "View Rooms",
      dismissible: true,
      icon: Sparkles,
    },
    {
      id: "demo-security",
      title:
        "Security recommendation: add missing serial numbers",
      description:
        "Complete device records to improve warranty and insurance readiness.",
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "security",
      type: "info",
      href: "/audit",
      actionLabel: "Run Audit",
      dismissible: true,
      icon: CircleAlert,
    },
    {
      id: "demo-receipt",
      title:
        "Brother Printer needs a document",
      description:
        "Upload its receipt or purchase record to improve vault coverage.",
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "backup",
      type: "info",
      href: "/devices",
      actionLabel: "Upload",
      dismissible: true,
      icon: FileText,
    },
    {
      id: "demo-device",
      title: "MacBook Pro was added to your vault",
      description:
        "Review the device record and attach supporting documents.",
      timestamp: new Date().toISOString(),
      priority: "low",
      category: "device",
      type: "success",
      href: "/devices",
      actionLabel: "Open Device",
      dismissible: true,
      icon: Laptop,
    },
  ];
