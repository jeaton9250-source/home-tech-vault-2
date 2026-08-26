import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileText,
  HardDrive,
  Home,
  LifeBuoy,
  MousePointerClick,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  loadAdminAnalytics,
  loadAdminSystemHealth,
} from "@/lib/admin/data/loaders";

import {
  loadAdminDashboardMetrics,
} from "@/lib/admin/data/dashboard";

import {
  loadAdminVercelAnalytics,
} from "@/lib/admin/data/vercelAnalytics";

import {
  loadFoundingMembersDashboardMetrics,
} from "@/lib/admin/data/foundingMembers";

import {
  loadAdminHealthCheckMetrics,
} from "@/lib/admin/data/healthCheck";

import {
  buildNeedsAttention,
  buildPlatformActivity,
  getFounderFirstName,
} from "@/lib/admin/founderControlCenter";

import FounderHeader, {
  FounderLinkAction,
  FounderSection,
} from "@/components/admin/founder-control-center/FounderHeader";

import {
  FounderActivityTimeline,
  FounderRecentSignups,
} from "@/components/admin/founder-control-center/FounderLists";

import {
  FounderAttentionList,
} from "@/components/admin/founder-control-center/FounderPriorities";

export const metadata = {
  title:
    "Founder Control Center — Home Tech Vault Admin",
};

function percentage(
  value: number,
  total: number
) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (value / total) * 100
    )
  );
}

function startOfToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
}

function OperationalMetric({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "positive" | "warning";
}) {
  const iconClass =
    tone === "positive"
      ? "border-[#718d4f]/20 bg-[#718d4f]/10 text-[#617c43]"
      : tone === "warning"
        ? "border-[#c89b48]/20 bg-[#c89b48]/10 text-[#9a7027]"
        : "border-[#e3ddd3] bg-[#f5f1e9] text-[#66717a]";

  return (
    <div className="rounded-[24px] border border-[#182533]/[0.07] bg-[#fffdf9] px-6 py-5 shadow-[0_22px_55px_-48px_rgba(20,32,45,0.52)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_65px_-50px_rgba(20,32,45,0.58)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777168]">
            {label}
          </p>

          <p className="mt-3 font-serif text-[38px] font-semibold leading-none tracking-[-0.05em] text-[#18202b]">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>

          <p className="mt-2.5 text-[13px] text-[#706b64]">
            {hint}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FunnelStage({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-[#c0cbb8]">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-3 font-serif text-[40px] font-semibold leading-none tracking-[-0.05em] text-[#f8f5ef]">
        {value.toLocaleString()}
      </p>

      <p className="mt-1 text-sm leading-5 text-white/60">
        {detail}
      </p>
    </div>
  );
}

function FunnelArrow({
  rate,
}: {
  rate: number | null;
}) {
  return (
    <div className="hidden shrink-0 items-center gap-2 px-2 xl:flex">
      {rate !== null ? (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white/70">
          {rate}%
        </span>
      ) : null}

      <ArrowRight
        size={17}
        className="text-white/20"
        aria-hidden="true"
      />
    </div>
  );
}

function AcquisitionCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#182533]/[0.07] bg-[#fffdf9] px-6 py-5 shadow-[0_18px_45px_-45px_rgba(20,32,45,0.48)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ded4] bg-[#f6f2ea] text-[#66717a]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777168]">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#18202b]">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>
        </div>
      </div>

      <p className="mt-3 truncate text-sm text-[#5f5b55]">
        {hint}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [
    metrics,
    analytics,
    health,
    foundingMetricsResult,
    traffic,
    healthCheckMetrics,
  ] = await Promise.all([
    loadAdminDashboardMetrics(),
    loadAdminAnalytics(),
    loadAdminSystemHealth(),

    loadFoundingMembersDashboardMetrics().catch(
      () => null
    ),

    loadAdminVercelAnalytics(),

    loadAdminHealthCheckMetrics(),
  ]);

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminFullName:
    | string
    | null = null;

  if (user) {
    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    adminFullName =
      profile?.full_name ?? null;
  }

  const firstName =
    getFounderFirstName(
      adminFullName,
      user?.email ?? null
    );

  const priorityIds =
    new Set<string>();

  const attentionItems =
    buildNeedsAttention(
      metrics,
      health,
      foundingMetricsResult,
      priorityIds
    );

  const activity =
    buildPlatformActivity(
      metrics.recentSignups,
      metrics.recentUpgrades,
      metrics.recentSupportActivity
    );

  const paidMembers =
    metrics.proUsers +
    metrics.familyUsers;

  const todayStart =
    startOfToday();

  const upgradesToday =
    metrics.recentUpgrades.filter(
      (upgrade) => {
        if (!upgrade.updatedAt) {
          return false;
        }

        return (
          new Date(
            upgrade.updatedAt
          ).getTime() >= todayStart
        );
      }
    ).length;

  const visitors =
    traffic.available
      ? traffic.visitors
      : 0;

  const pageviews =
    traffic.available
      ? traffic.pageviews
      : 0;

  const totalChecks =
    healthCheckMetrics.totalCompleted;

  /*
   * Funnel percentages are intentionally
   * presented as directional snapshot ratios.
   *
   * Traffic is a rolling 30-day metric while
   * Health Check/user totals can have different
   * collection windows. We do not call these
   * strict conversion rates yet.
   */
  const visitorToCheck =
    visitors > 0
      ? percentage(
          totalChecks,
          visitors
        )
      : null;

  const totalUsers =
    analytics.totalUsers;

  const checksToUsers =
    totalChecks > 0
      ? percentage(
          Math.min(
            totalUsers,
            totalChecks
          ),
          totalChecks
        )
      : null;

  const usersToPaid =
    totalUsers > 0
      ? percentage(
          paidMembers,
          totalUsers
        )
      : null;

  return (
    <>
      <FounderHeader
        firstName={firstName}
      />

      {/* TODAY */}
      <FounderSection
        id="founder-today-heading"
        title="Today"
        subtitle="Your operating brief for the day."
      >
        <div className="grid gap-5 xl:grid-cols-[1.05fr_1.45fr]">
          {/* FOUNDER BRIEF */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#142b40] p-6 text-[#f8f5ef] shadow-[0_28px_70px_-50px_rgba(8,20,32,0.85)] md:p-7">
            <div
              aria-hidden="true"
              className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[#718d4f]/10 blur-3xl"
            />

            <div className="relative flex h-full min-h-[220px] flex-col">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9bc90]">
                  Founder brief
                </p>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8da66e]" />
                  Live
                </span>
              </div>

              {metrics.openSupportTickets > 0 ? (
                <>
                  <p className="mt-7 max-w-md font-serif text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[36px]">
                    Support needs your attention.
                  </p>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                    {metrics.openSupportTickets.toLocaleString()} open{" "}
                    {metrics.openSupportTickets === 1
                      ? "ticket is"
                      : "tickets are"}{" "}
                    waiting in the support queue.
                  </p>

                  <a
                    href="/admin/support"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-semibold text-[#c0d0ac] transition hover:text-white"
                  >
                    Review support
                    <ArrowRight size={15} />
                  </a>
                </>
              ) : attentionItems.length > 0 ? (
                <>
                  <p className="mt-7 max-w-md font-serif text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[36px]">
                    {attentionItems.length} platform{" "}
                    {attentionItems.length === 1
                      ? "item needs"
                      : "items need"}{" "}
                    review.
                  </p>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                    Nothing urgent is blocking the platform, but there are
                    items worth reviewing before you move on.
                  </p>

                  <a
                    href="/admin/system"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-semibold text-[#c0d0ac] transition hover:text-white"
                  >
                    Review platform
                    <ArrowRight size={15} />
                  </a>
                </>
              ) : (
                <>
                  <p className="mt-7 max-w-md font-serif text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[36px]">
                    Everything looks clear.
                  </p>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                    No support or platform issues currently need your
                    attention. You can focus on growth and customer activity.
                  </p>

                  <a
                    href="/admin/activity"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-semibold text-[#c0d0ac] transition hover:text-white"
                  >
                    View live activity
                    <ArrowRight size={15} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* TODAY METRICS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <OperationalMetric
              label="New Users"
              value={metrics.newUsersToday}
              hint="Joined today"
              tone="positive"
              icon={
                <UserPlus
                  size={17}
                  aria-hidden="true"
                />
              }
            />

            <OperationalMetric
              label="Health Checks"
              value={
                healthCheckMetrics.completedToday
              }
              hint="Completed today"
              tone="positive"
              icon={
                <ClipboardCheck
                  size={17}
                  aria-hidden="true"
                />
              }
            />

            <OperationalMetric
              label="New Paid"
              value={upgradesToday}
              hint="Upgrades today"
              icon={
                <CreditCard
                  size={17}
                  aria-hidden="true"
                />
              }
            />

            <OperationalMetric
              label="Open Support"
              value={
                metrics.openSupportTickets
              }
              hint={
                metrics.openSupportTickets > 0
                  ? "Needs attention"
                  : "Inbox clear"
              }
              tone={
                metrics.openSupportTickets > 0
                  ? "warning"
                  : "positive"
              }
              icon={
                <LifeBuoy
                  size={17}
                  aria-hidden="true"
                />
              }
            />
          </div>
        </div>
      </FounderSection>

      {/* FUNNEL */}
      <FounderSection
        id="founder-funnel-heading"
        title="Growth Funnel"
        subtitle="A directional view of acquisition through paid membership."
        action={
          <FounderLinkAction
            href="/admin/analytics"
            label="Open analytics"
          />
        }
      >
        <div className="overflow-hidden rounded-[30px] border border-white/[0.04] bg-[#142b40] shadow-[0_34px_80px_-50px_rgba(7,18,29,0.85)]">
          <div className="border-b border-white/[0.07] px-6 py-5 md:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#f5f1e8]">
                  Acquisition snapshot
                </p>

                <p className="mt-1 text-sm text-white/55">
                  Traffic uses the last 30 days.
                  Other stages use currently
                  available platform totals.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718d4f]/25 bg-[#718d4f]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a9bc90]">
                <CheckCircle2
                  size={12}
                />
                Live Data
              </span>
            </div>
          </div>

          <div className="grid gap-7 p-6 sm:grid-cols-2 md:p-7 xl:flex xl:items-center">
            <FunnelStage
              label="Visitors"
              value={visitors}
              detail="Production visitors · 30 days"
              icon={
                <Eye size={15} />
              }
            />

            <FunnelArrow
              rate={visitorToCheck}
            />

            <FunnelStage
              label="Health Checks"
              value={totalChecks}
              detail={`${healthCheckMetrics.completedToday} completed today`}
              icon={
                <ClipboardCheck
                  size={15}
                />
              }
            />

            <FunnelArrow
              rate={checksToUsers}
            />

            <FunnelStage
              label="Users"
              value={totalUsers}
              detail={`${metrics.newUsersThisWeek} joined this week`}
              icon={
                <Users size={15} />
              }
            />

            <FunnelArrow
              rate={usersToPaid}
            />

            <FunnelStage
              label="Paid"
              value={paidMembers}
              detail={`${metrics.proUsers} Pro · ${metrics.familyUsers} Family`}
              icon={
                <CreditCard
                  size={15}
                />
              }
            />
          </div>
        </div>
      </FounderSection>

      {/* ACQUISITION + HEALTH CHECK */}
      <FounderSection
        id="founder-growth-intelligence-heading"
        title="Growth Intelligence"
        subtitle="Traffic, acquisition, and Health Check performance in one operating view."
        action={
          <FounderLinkAction
            href="/admin/analytics"
            label="Open analytics"
          />
        }
      >
        <div className="overflow-hidden rounded-[30px] border border-[#182533]/10 bg-[#fffdf9] shadow-[0_28px_70px_-55px_rgba(18,32,45,0.58)]">
          <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
            <section className="p-6 md:p-7 xl:border-r xl:border-[#182533]/10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                    Acquisition
                  </p>

                  <h3 className="mt-2 font-serif text-[24px] font-semibold tracking-[-0.035em] text-[#18202b]">
                    Audience & discovery
                  </h3>

                  <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#706b64]">
                    Where visitors are coming from and how they are finding Home Tech Vault.
                  </p>
                </div>

                <div className="hidden rounded-full border border-[#718d4f]/20 bg-[#718d4f]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#617c43] sm:block">
                  30 day view
                </div>
              </div>

<div className="grid gap-3 sm:grid-cols-2">
            <AcquisitionCard
              label="Visitors"
              value={visitors}
              hint="Unique visitors · last 30 days"
              icon={
                <Eye size={16} />
              }
            />

            <AcquisitionCard
              label="Pageviews"
              value={pageviews}
              hint="Production pageviews · last 30 days"
              icon={
                <MousePointerClick
                  size={16}
                />
              }
            />

            <AcquisitionCard
              label="Top Referral"
              value={
                traffic.available
                  ? traffic.topReferrers[0]
                      ?.visitors ?? 0
                  : 0
              }
              hint={
                traffic.available
                  ? traffic.topReferrers[0]
                      ?.label ??
                    "No referral data"
                  : "Traffic unavailable"
              }
              icon={
                <Share2 size={16} />
              }
            />

            <AcquisitionCard
              label="Reddit Checks"
              value={
                healthCheckMetrics.redditCompleted
              }
              hint="Health Checks with utm_source=reddit"
              icon={
                <BarChart3
                  size={16}
                />
              }
            />
          </div>
            </section>

            <section className="border-t border-[#182533]/10 p-6 md:p-7 xl:border-t-0">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                    Health Check
                  </p>

                  <h3 className="mt-2 font-serif text-[24px] font-semibold tracking-[-0.035em] text-[#18202b]">
                    Diagnostic performance
                  </h3>

                  <p className="mt-2 text-[14px] leading-6 text-[#706b64]">
                    Completion volume, scoring, and attribution from the public diagnostic.
                  </p>
                </div>

                <a
                  href="/health-check"
                  className="shrink-0 text-sm font-medium text-[#617c43] transition hover:text-[#4e6636]"
                >
                  Open tool ↗
                </a>
              </div>

          <div className="rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9] p-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777168]">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#18202b]">
                  {healthCheckMetrics.totalCompleted}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777168]">
                  Average Score
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#18202b]">
                  {healthCheckMetrics.averageScore}
                </p>
              </div>
            </div>

            <div className="mt-5 h-px bg-[#e5dfd5]" />

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#18202b]">
                  Reddit attribution
                </p>

                <p className="mt-1 text-sm text-[#5f5b55]">
                  Completions carrying the
                  Reddit UTM source.
                </p>
              </div>

              <div className="rounded-xl border border-[#718d4f]/20 bg-[#718d4f]/8 px-3 py-2 text-lg font-semibold text-[#617c43]">
                {
                  healthCheckMetrics.redditCompleted
                }
              </div>
            </div>
          </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#182533]/10 bg-[#f7f3ec] px-6 py-4 md:px-7">
            <p className="text-[12px] text-[#777168]">
              Growth Intelligence combines production traffic with currently available platform and Health Check data.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="/admin/analytics"
                className="text-[12px] font-semibold text-[#617c43] transition hover:text-[#4e6636]"
              >
                View analytics →
              </a>

              <a
                href="/admin/activity"
                className="text-[12px] font-semibold text-[#617c43] transition hover:text-[#4e6636]"
              >
                View activity →
              </a>
            </div>
          </div>
        </div>
      </FounderSection>

      {/* PLATFORM */}
      <FounderSection
        id="founder-platform-heading"
        title="Platform"
        subtitle="Core inventory currently stored across Home Tech Vault."
      >
        <div className="grid overflow-hidden rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9] sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Users",
              value:
                analytics.totalUsers,
              icon: Users,
            },
            {
              label: "Households",
              value:
                analytics.totalHouseholds,
              icon: Home,
            },
            {
              label: "Devices",
              value:
                analytics.totalDevices,
              icon: HardDrive,
            },
            {
              label: "Documents",
              value:
                analytics.totalDocuments,
              icon: FileText,
            },
          ].map(
            ({
              label,
              value,
              icon: Icon,
            }, index) => (
              <div
                key={label}
                className={[
                  "px-5 py-5",
                  index > 0
                    ? "border-t border-[#e6e0d6] sm:border-t-0"
                    : "",
                  index % 2 !== 0
                    ? "sm:border-l sm:border-[#e6e0d6]"
                    : "",
                  index >= 2
                    ? "xl:border-l xl:border-[#e6e0d6]"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777168]">
                      {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#18202b]">
                      {value.toLocaleString()}
                    </p>
                  </div>

                  <Icon
                    size={17}
                    className="text-[#8d958f]"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </FounderSection>

      {/* OPERATIONS */}
      <div className="grid gap-7 xl:grid-cols-2">
        <FounderActivityTimeline
          events={activity}
        />

        <FounderAttentionList
          items={attentionItems}
        />
      </div>

      {/* RECENT CUSTOMERS */}
      <FounderRecentSignups
        signups={metrics.recentSignups}
      />

      <div className="flex items-center gap-2 border-t border-[#ded8ce] pt-5 text-xs text-[#8a867f]">
        <Activity
          size={14}
          aria-hidden="true"
        />

        Founder Control Center uses live
        production data where available.
      </div>
    </>
  );
}
