import type {
  AdminDashboardMetrics,
  AdminRecentSignup,
  AdminRecentSupportActivity,
  AdminRecentUpgrade,
  AdminSystemHealth,
} from "@/lib/admin/types";
import type { FoundingMembersDashboardMetrics } from "@/lib/founding-members/types";

export type FounderPriorityTone =
  | "urgent"
  | "review"
  | "success"
  | "neutral";

export type FounderPriorityItem = {
  id: string;
  title: string;
  description: string;
  count?: number;
  href: string;
  tone: FounderPriorityTone;
};

export type FounderAttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type FounderActivityEvent = {
  id: string;
  description: string;
  timestamp: string;
  href?: string;
  kind: "signup" | "upgrade" | "support";
};

export function getFounderFirstName(
  fullName: string | null | undefined,
  email: string | null | undefined
) {
  const trimmed = fullName?.trim();

  if (trimmed) {
    return trimmed.split(/\s+/)[0] ?? "";
  }

  if (email) {
    return email.split("@")[0] ?? "";
  }

  return "";
}

export function buildTodaysPriorities(
  metrics: AdminDashboardMetrics,
  health: AdminSystemHealth,
  foundingMetrics: FoundingMembersDashboardMetrics | null
): FounderPriorityItem[] {
  const items: FounderPriorityItem[] = [];

  if (metrics.openSupportTickets > 0) {
    items.push({
      id: "open-support",
      title: "Open support requests",
      description:
        metrics.newSupportTickets > 0
          ? `${metrics.newSupportTickets} new today · ${metrics.openSupportTickets} awaiting review`
          : `${metrics.openSupportTickets} ticket${metrics.openSupportTickets === 1 ? "" : "s"} need review`,
      count: metrics.openSupportTickets,
      href: "/admin/support",
      tone: metrics.newSupportTickets > 0 ? "urgent" : "review",
    });
  } else if (metrics.newSupportTickets > 0) {
    items.push({
      id: "new-support",
      title: "New support requests",
      description: `${metrics.newSupportTickets} ticket${metrics.newSupportTickets === 1 ? "" : "s"} arrived today`,
      count: metrics.newSupportTickets,
      href: "/admin/support",
      tone: "review",
    });
  }

  if (!health.supabaseConnected) {
    items.push({
      id: "supabase-down",
      title: "Database connection issue",
      description:
        "Supabase could not be reached during the health check.",
      href: "/admin/system",
      tone: "urgent",
    });
  }

  if (metrics.systemWarnings.length > 0) {
    items.push({
      id: "config-warning",
      title: "Configuration needs review",
      description: metrics.systemWarnings[0] ?? "",
      count: metrics.systemWarnings.length,
      href: "/admin/system",
      tone: "review",
    });
  }

  if (
    foundingMetrics &&
    foundingMetrics.programStatus === "open" &&
    foundingMetrics.remainingSpots > 0 &&
    foundingMetrics.remainingSpots <= 10
  ) {
    items.push({
      id: "founding-capacity",
      title: "Founding member capacity",
      description: `${foundingMetrics.remainingSpots} spot${foundingMetrics.remainingSpots === 1 ? "" : "s"} remaining in the program`,
      count: foundingMetrics.remainingSpots,
      href: "/admin/founding-members",
      tone: "review",
    });
  }

  if (metrics.newUsersToday > 0) {
    items.push({
      id: "new-users-today",
      title: "New users today",
      description: `${metrics.newUsersToday} account${metrics.newUsersToday === 1 ? "" : "s"} joined the platform`,
      count: metrics.newUsersToday,
      href: "/admin/users",
      tone: "success",
    });
  }

  return items.slice(0, 4);
}

export function buildNeedsAttention(
  metrics: AdminDashboardMetrics,
  health: AdminSystemHealth,
  foundingMetrics: FoundingMembersDashboardMetrics | null,
  priorityIds: Set<string>
): FounderAttentionItem[] {
  const items: FounderAttentionItem[] = [];

  if (
    metrics.systemWarnings.length > 0 &&
    !priorityIds.has("config-warning")
  ) {
    for (const warning of metrics.systemWarnings) {
      items.push({
        id: `warning-${warning}`,
        title: "Configuration issue",
        description: warning,
        href: "/admin/system",
      });
    }
  }

  if (
    !health.resendConfigured &&
    !priorityIds.has("config-warning")
  ) {
    items.push({
      id: "resend-missing",
      title: "Email delivery not configured",
      description:
        "Resend is required for transactional email.",
      href: "/admin/emails",
    });
  }

  if (
    !health.stripeConfigured &&
    !priorityIds.has("config-warning")
  ) {
    items.push({
      id: "stripe-missing",
      title: "Billing integration incomplete",
      description:
        "Stripe credentials are not fully configured.",
      href: "/admin/subscriptions",
    });
  }

  if (
    foundingMetrics &&
    foundingMetrics.programStatus === "full" &&
    !priorityIds.has("founding-capacity")
  ) {
    items.push({
      id: "founding-full",
      title: "Founding program full",
      description:
        "All founding member spots have been claimed.",
      href: "/admin/founding-members",
    });
  }

  const seen = new Set<string>();

  return items
    .filter((item) => {
      const key = `${item.title}:${item.description}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

export function buildPlatformActivity(
  signups: AdminRecentSignup[],
  upgrades: AdminRecentUpgrade[],
  support: AdminRecentSupportActivity[]
): FounderActivityEvent[] {
  const events: FounderActivityEvent[] = [
    ...signups.map((signup) => ({
      id: `signup-${signup.id}`,
      kind: "signup" as const,
      description: `${signup.fullName || signup.email || "A new user"} joined Home Tech Vault`,
      timestamp: signup.createdAt,
      href: `/admin/users?selected=${signup.id}`,
    })),
    ...upgrades.map((upgrade) => ({
      id: `upgrade-${upgrade.userId}-${upgrade.updatedAt}`,
      kind: "upgrade" as const,
      description: `${upgrade.email || "A user"} moved to the ${upgrade.plan} plan (${upgrade.status})`,
      timestamp: upgrade.updatedAt ?? "",
      href: `/admin/users?selected=${upgrade.userId}`,
    })),
    ...support.map((ticket) => ({
      id: `support-${ticket.id}`,
      kind: "support" as const,
      description: `${ticket.ticketNumber}: ${ticket.subject}`,
      timestamp: ticket.createdAt,
      href: `/admin/support/${ticket.id}`,
    })),
  ];

  return events
    .filter((event) => event.timestamp)
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime()
    )
    .slice(0, 8);
}
