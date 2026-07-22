import {
  FileText,
  HardDrive,
  Home,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { loadAdminAnalytics } from "@/lib/admin/data/loaders";
import { loadAdminDashboardMetrics } from "@/lib/admin/data/dashboard";
import { loadAdminSystemHealth } from "@/lib/admin/data/loaders";
import { loadFoundingMembersDashboardMetrics } from "@/lib/admin/data/foundingMembers";
import {
  buildNeedsAttention,
  buildPlatformActivity,
  buildTodaysPriorities,
  getFounderFirstName,
} from "@/lib/admin/founderControlCenter";
import FounderHeader, {
  FounderSection,
} from "@/components/admin/founder-control-center/FounderHeader";
import FounderPriorities, {
  FounderAttentionList,
  FounderFeedbackEmptyState,
} from "@/components/admin/founder-control-center/FounderPriorities";
import {
  FounderGrowthGrid,
  FounderMetricCard,
} from "@/components/admin/founder-control-center/FounderMetricCards";
import {
  FounderActivityTimeline,
  FounderQuickActions,
  FounderRecentSignups,
} from "@/components/admin/founder-control-center/FounderLists";

export const metadata = {
  title: "Founder Control Center — Home Tech Vault Admin",
};

export default async function AdminDashboardPage() {
  const [
    metrics,
    analytics,
    health,
    foundingMetricsResult,
  ] = await Promise.all([
    loadAdminDashboardMetrics(),
    loadAdminAnalytics(),
    loadAdminSystemHealth(),
    loadFoundingMembersDashboardMetrics().catch(
      () => null
    ),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminFullName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    adminFullName = profile?.full_name ?? null;
  }

  const firstName = getFounderFirstName(
    adminFullName,
    user?.email ?? null
  );

  const priorities = buildTodaysPriorities(
    metrics,
    health,
    foundingMetricsResult
  );

  const priorityIds = new Set(
    priorities.map((item) => item.id)
  );

  const attentionItems = buildNeedsAttention(
    metrics,
    health,
    foundingMetricsResult,
    priorityIds
  );

  const activity = buildPlatformActivity(
    metrics.recentSignups,
    metrics.recentUpgrades,
    metrics.recentSupportActivity
  );

  const paidMembers =
    metrics.proUsers + metrics.familyUsers;

  return (
    <>
      <FounderHeader firstName={firstName} />

      <FounderPriorities items={priorities} />

      <FounderSection
        id="founder-platform-snapshot-heading"
        title="Platform Snapshot"
        subtitle="Core inventory across the platform."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FounderMetricCard
            label="Users"
            value={analytics.totalUsers}
            hint={`${metrics.newUsersThisWeek} added this week`}
            href="/admin/users"
            icon={
              <Users
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />
          <FounderMetricCard
            label="Households"
            value={analytics.totalHouseholds}
            href="/admin/households"
            icon={
              <Home
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />
          <FounderMetricCard
            label="Devices"
            value={analytics.totalDevices}
            href="/admin/analytics"
            icon={
              <HardDrive
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />
          <FounderMetricCard
            label="Documents"
            value={analytics.totalDocuments}
            href="/admin/analytics"
            icon={
              <FileText
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />
        </div>
      </FounderSection>

      <FounderSection
        id="founder-growth-snapshot-heading"
        title="Growth Snapshot"
        subtitle="Signup and subscription activity currently tracked."
      >
        <FounderGrowthGrid
          metrics={[
            {
              label: "New users today",
              value: metrics.newUsersToday,
            },
            {
              label: "New users this week",
              value: metrics.newUsersThisWeek,
            },
            {
              label: "Active subscriptions",
              value: metrics.activeSubscriptions,
              hint: "Active or trialing plans",
            },
            {
              label: "Paid members",
              value: paidMembers,
              hint: `${metrics.proUsers} Pro · ${metrics.familyUsers} Family`,
            },
          ]}
        />
      </FounderSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <FounderAttentionList
          items={attentionItems}
        />
        <FounderRecentSignups
          signups={metrics.recentSignups}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <FounderActivityTimeline
          events={activity}
        />
        <FounderFeedbackEmptyState />
      </div>

      <FounderQuickActions />
    </>
  );
}
