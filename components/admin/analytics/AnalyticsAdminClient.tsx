"use client";

import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  HardDrive,
  Home,
  MousePointerClick,
  Share2,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminStatusBadge,
} from "@/components/admin/layout/AdminPageLayout";

import type {
  AdminAnalyticsSnapshot,
  AdminVercelAnalyticsSnapshot,
} from "@/lib/admin/types";

import type {
  AdminHealthCheckMetrics,
} from "@/lib/admin/data/healthCheck";


const EXTERNAL_LINKS = [
  {
    label: "Vercel",
    description:
      "Traffic and production analytics",
    href: "https://vercel.com/dashboard",
  },
  {
    label: "Supabase",
    description:
      "Database and authentication",
    href: "https://supabase.com/dashboard",
  },
  {
    label: "Stripe",
    description:
      "Subscriptions and payments",
    href: "https://dashboard.stripe.com/",
  },
  {
    label: "Google Analytics",
    description:
      "Website reporting",
    href: "https://analytics.google.com/",
  },
  {
    label: "Search Console",
    description:
      "Organic search visibility",
    href: "https://search.google.com/search-console",
  },
  {
    label: "Resend",
    description:
      "Transactional email delivery",
    href: "https://resend.com/emails",
  },
] as const;


function formatDateRange(
  since: string,
  until: string
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );

  return `${formatter.format(
    new Date(since)
  )} – ${formatter.format(
    new Date(until)
  )}`;
}


function formatShortDate(
  date: string
) {
  return new Date(
    `${date}T12:00:00Z`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}


function AnalyticsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#18202b]">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
              {description}
            </p>
          ) : null}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}


function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9] p-5 shadow-[0_8px_28px_-23px_rgba(23,32,42,0.32)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a62]">
            {label}
          </p>

          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#18202b]">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>

          <p className="mt-2 text-sm text-[#5f5b55]">
            {hint}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e4ded4] bg-[#f5f1e9] text-[#65717a]">
          {icon}
        </div>
      </div>
    </div>
  );
}


function RankingList({
  rows,
  valueLabel,
}: {
  rows: Array<{
    label: string;
    visitors: number;
    pageviews: number;
  }>;
  valueLabel: "visitors" | "pageviews";
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9] p-5 text-sm text-[#5f5b55]">
        No data has been recorded yet.
      </div>
    );
  }

  const maximum = Math.max(
    ...rows.map((row) =>
      valueLabel === "visitors"
        ? row.visitors
        : row.pageviews
    ),
    1
  );

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9]">
      {rows.slice(0, 6).map(
        (row, index) => {
          const value =
            valueLabel === "visitors"
              ? row.visitors
              : row.pageviews;

          const width = Math.max(
            (value / maximum) * 100,
            3
          );

          return (
            <div
              key={`${row.label}-${index}`}
              className="border-b border-[#e7e1d7] px-5 py-4 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f2eee6] text-xs font-semibold text-[#777169]">
                    {index + 1}
                  </span>

                  <span className="truncate text-sm font-medium text-[#18202b]">
                    {row.label}
                  </span>
                </div>

                <span className="shrink-0 text-sm font-semibold text-[#18202b]">
                  {value.toLocaleString()}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eee8df]">
                <div
                  className="h-full rounded-full bg-[#718d4f]"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-[#777169]">
                {row.visitors.toLocaleString()} visitors ·{" "}
                {row.pageviews.toLocaleString()} pageviews
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}


function ProductMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e6e0d6] px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2eee6] text-[#66717a]">
          {icon}
        </div>

        <p className="text-sm font-medium text-[#42474b]">
          {label}
        </p>
      </div>

      <p className="text-xl font-semibold tracking-[-0.03em] text-[#18202b]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}


function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#dcd6cc] bg-[#fffdf9] px-3 py-2.5 shadow-lg">
      <p className="text-xs font-semibold text-[#18202b]">
        {label}
      </p>

      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="text-xs text-[#5f5b55]"
          >
            {entry.name}:{" "}
            <span className="font-semibold text-[#18202b]">
              {Number(
                entry.value ?? 0
              ).toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}


export default function AnalyticsAdminClient({
  analytics,
  vercelAnalytics,
  healthCheckMetrics,
}: {
  analytics: AdminAnalyticsSnapshot;
  vercelAnalytics:
    AdminVercelAnalyticsSnapshot;
  healthCheckMetrics:
    AdminHealthCheckMetrics;
}) {
  const dateRange =
    formatDateRange(
      vercelAnalytics.since,
      vercelAnalytics.until
    );

  const averageViewsPerVisitor =
    vercelAnalytics.visitors > 0
      ? (
          vercelAnalytics.pageviews /
          vercelAnalytics.visitors
        ).toFixed(1)
      : "0";

  const totalSignups30Days =
    analytics.signupsByDay.reduce(
      (sum, entry) =>
        sum + entry.count,
      0
    );

  const trafficData =
    vercelAnalytics.dailyTraffic.map(
      (entry) => ({
        date: formatShortDate(
          entry.date
        ),
        visitors:
          entry.visitors,
        pageviews:
          entry.pageviews,
      })
    );

  const signupData =
    analytics.signupsByDay.map(
      (entry) => ({
        date: formatShortDate(
          entry.date
        ),
        signups: entry.count,
      })
    );

  const totalPlans =
    analytics.planDistribution.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-5 border-b border-[#ded8ce] pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-[#617c43]">
              Growth Intelligence
            </p>

            <AdminStatusBadge
              tone={
                vercelAnalytics.available
                  ? "success"
                  : vercelAnalytics.configured
                    ? "warning"
                    : "neutral"
              }
            >
              {vercelAnalytics.available
                ? "Live production data"
                : vercelAnalytics.configured
                  ? "Traffic unavailable"
                  : "Vercel not connected"}
            </AdminStatusBadge>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#17202a] md:text-[40px] md:leading-none">
            Analytics
          </h1>

          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5d5a54]">
            Understand how people find Home Tech Vault,
            what they use, and where growth is happening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#ded8ce] bg-[#fffdf9] px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777169]">
              Reporting period
            </p>

            <p className="mt-0.5 text-sm font-medium text-[#18202b]">
              {dateRange}
            </p>
          </div>

          <Link
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#172635] px-4 text-sm font-semibold text-white transition hover:bg-[#213449]"
          >
            Open Vercel
            <ExternalLink
              size={15}
            />
          </Link>
        </div>
      </header>


      {/* TOP KPIS */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Visitors"
          value={
            vercelAnalytics.visitors
          }
          hint="Unique visitors · 30 days"
          icon={
            <Users size={18} />
          }
        />

        <MetricCard
          label="Pageviews"
          value={
            vercelAnalytics.pageviews
          }
          hint="Production pageviews"
          icon={
            <Eye size={18} />
          }
        />

        <MetricCard
          label="Views / Visitor"
          value={
            averageViewsPerVisitor
          }
          hint="Average browsing depth"
          icon={
            <MousePointerClick
              size={18}
            />
          }
        />

        <MetricCard
          label="New Users"
          value={totalSignups30Days}
          hint="Profiles created · 30 days"
          icon={
            <Activity size={18} />
          }
        />
      </div>


      {/* TRAFFIC CHART */}
      <AnalyticsSection
        title="Traffic"
        description={`Visitors and pageviews across production · ${dateRange}`}
      >
        {vercelAnalytics.available ? (
          vercelAnalytics.dailyTraffic
            .length > 0 ? (
            <div className="rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9] p-5 md:p-6">
              <div className="mb-6 flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2 text-[#5f5b55]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#718d4f]" />
                  Visitors
                </div>

                <div className="flex items-center gap-2 text-[#5f5b55]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#172635]" />
                  Pageviews
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={trafficData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#e8e2d9"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: "#777169",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />

                    <YAxis
                      tick={{
                        fill: "#777169",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      name="Pageviews"
                      stroke="#172635"
                      fill="#172635"
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />

                    <Area
                      type="monotone"
                      dataKey="visitors"
                      name="Visitors"
                      stroke="#718d4f"
                      fill="#718d4f"
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="No traffic data"
              description="No daily Vercel traffic was returned for this reporting period."
            />
          )
        ) : (
          <AdminErrorState
            message={
              vercelAnalytics.error ??
              "Vercel Analytics is unavailable."
            }
          />
        )}
      </AnalyticsSection>


      {/* ACQUISITION */}
      <div className="grid gap-7 xl:grid-cols-2">
        <AnalyticsSection
          title="Traffic Sources"
          description="Where visitors are discovering Home Tech Vault."
        >
          <RankingList
            rows={
              vercelAnalytics.topReferrers
            }
            valueLabel="visitors"
          />
        </AnalyticsSection>

        <AnalyticsSection
          title="Top Pages"
          description="The routes receiving the most attention."
        >
          <RankingList
            rows={
              vercelAnalytics.topPages
            }
            valueLabel="pageviews"
          />
        </AnalyticsSection>
      </div>


      {/* HEALTH CHECK */}
      <AnalyticsSection
        title="Health Check Performance"
        description="How the free Home Tech Health Check is performing as an acquisition tool."
        action={
          <Link
            href="/health-check"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#617c43] hover:text-[#4e6636]"
          >
            Open Health Check
            <ArrowUpRight
              size={15}
            />
          </Link>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[22px] border border-[#152638] bg-[#0b1623]">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label:
                    "Total Completed",
                  value:
                    healthCheckMetrics.totalCompleted,
                },
                {
                  label:
                    "Completed Today",
                  value:
                    healthCheckMetrics.completedToday,
                },
                {
                  label:
                    "Average Score",
                  value:
                    healthCheckMetrics.averageScore,
                },
                {
                  label:
                    "From Reddit",
                  value:
                    healthCheckMetrics.redditCompleted,
                },
              ].map(
                (
                  metric,
                  index
                ) => (
                  <div
                    key={
                      metric.label
                    }
                    className={[
                      "p-5",
                      index > 0
                        ? "border-t border-white/10 sm:border-t-0 sm:border-l"
                        : "",
                    ].join(" ")}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">
                      {metric.label}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#f4f0e8]">
                      {
                        metric.value
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#718d4f]/10 text-[#617c43]">
                <ClipboardCheck
                  size={18}
                />
              </div>

              <div>
                <p className="font-semibold text-[#18202b]">
                  Acquisition signal
                </p>

                <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
                  Reddit completions are
                  counted when the Health
                  Check is completed with
                  <span className="font-medium">
                    {" "}
                    utm_source=reddit
                  </span>.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#e5dfd5] pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5f5b55]">
                  Reddit share
                </span>

                <span className="font-semibold text-[#18202b]">
                  {healthCheckMetrics.totalCompleted >
                  0
                    ? Math.round(
                        (healthCheckMetrics.redditCompleted /
                          healthCheckMetrics.totalCompleted) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnalyticsSection>


      {/* GROWTH + PLAN MIX */}
      <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
        <AnalyticsSection
          title="Signups Over Time"
          description="New profiles created during the last 30 days."
        >
          <div className="rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9] p-5">
            {signupData.length > 0 ? (
              <div className="h-[270px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={signupData}
                    margin={{
                      top: 10,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#e8e2d9"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: "#777169",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={20}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#777169",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Bar
                      dataKey="signups"
                      name="Signups"
                      fill="#718d4f"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <AdminEmptyState
                title="No signup data"
                description="No new profiles were recorded during this period."
              />
            )}
          </div>
        </AnalyticsSection>

        <AnalyticsSection
          title="Plan Mix"
          description="Current subscription plan distribution."
        >
          <div className="overflow-hidden rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9]">
            {analytics.planDistribution
              .length > 0 ? (
              analytics.planDistribution.map(
                (entry) => {
                  const percentage =
                    totalPlans > 0
                      ? Math.round(
                          (entry.count /
                            totalPlans) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={
                        entry.plan
                      }
                      className="border-b border-[#e6e0d6] px-5 py-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="capitalize text-sm font-semibold text-[#18202b]">
                            {
                              entry.plan
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#777169]">
                            {
                              percentage
                            }
                            % of tracked plans
                          </p>
                        </div>

                        <p className="text-xl font-semibold text-[#18202b]">
                          {
                            entry.count
                          }
                        </p>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eee8df]">
                        <div
                          className="h-full rounded-full bg-[#718d4f]"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="p-5 text-sm text-[#5f5b55]">
                No subscription data
                available yet.
              </div>
            )}
          </div>
        </AnalyticsSection>
      </div>


      {/* PRODUCT ADOPTION */}
      <AnalyticsSection
        title="Product Adoption"
        description="Current inventory across the Home Tech Vault platform."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9]">
            <ProductMetric
              label="Users"
              value={
                analytics.totalUsers
              }
              icon={
                <Users size={17} />
              }
            />

            <ProductMetric
              label="Households"
              value={
                analytics.totalHouseholds
              }
              icon={
                <Home size={17} />
              }
            />

            <ProductMetric
              label="Devices"
              value={
                analytics.totalDevices
              }
              icon={
                <HardDrive
                  size={17}
                />
              }
            />

            <ProductMetric
              label="Documents"
              value={
                analytics.totalDocuments
              }
              icon={
                <FileText
                  size={17}
                />
              }
            />
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#dcd6cc] bg-[#fffdf9]">
            <ProductMetric
              label="Support Tickets"
              value={
                analytics.totalSupportTickets
              }
              icon={
                <Activity
                  size={17}
                />
              }
            />

            <ProductMetric
              label="Open Support"
              value={
                analytics.openSupportTickets
              }
              icon={
                <Activity
                  size={17}
                />
              }
            />

            <ProductMetric
              label="Family Invitations"
              value={
                analytics.familyInvitationsTotal
              }
              icon={
                <Share2 size={17} />
              }
            />

            <ProductMetric
              label="Health Checks"
              value={
                healthCheckMetrics.totalCompleted
              }
              icon={
                <ClipboardCheck
                  size={17}
                />
              }
            />
          </div>
        </div>
      </AnalyticsSection>


      {/* EXTERNAL TOOLS */}
      <AnalyticsSection
        title="External Tools"
        description="Jump directly into the services behind Home Tech Vault."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {EXTERNAL_LINKS.map(
            (link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-[18px] border border-[#e1dbd1] bg-[#fffdf9] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[#cfc8bd] hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-[#18202b]">
                    {link.label}
                  </p>

                  <p className="mt-1 text-xs text-[#777169]">
                    {
                      link.description
                    }
                  </p>
                </div>

                <ExternalLink
                  size={16}
                  className="text-[#99948c] transition group-hover:text-[#617c43]"
                />
              </Link>
            )
          )}
        </div>
      </AnalyticsSection>


      <div className="flex items-center gap-2 border-t border-[#ded8ce] pt-5 text-xs text-[#777169]">
        <BarChart3 size={14} />

        Traffic reporting covers the
        rolling 30-day Vercel Analytics
        window. Product totals reflect
        current production records.
      </div>
    </div>
  );
}
