"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  ExternalLink,
  Eye,
  FileText,
  HardDrive,
  MousePointerClick,
  Users,
} from "lucide-react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminPageHero,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import type {
  AdminAnalyticsSnapshot,
  AdminVercelAnalyticsSnapshot,
} from "@/lib/admin/types";

const EXTERNAL_LINKS = [
  {
    label: "Vercel Analytics",
    href: "https://vercel.com/dashboard",
  },
  {
    label: "Google Analytics",
    href: "https://analytics.google.com/",
  },
  {
    label: "Search Console",
    href: "https://search.google.com/search-console",
  },
  {
    label: "Stripe",
    href: "https://dashboard.stripe.com/",
  },
  {
    label: "Resend",
    href: "https://resend.com/emails",
  },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard",
  },
];

function formatDateRange(
  since: string,
  until: string
) {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return `${formatter.format(
    new Date(since)
  )} – ${formatter.format(new Date(until))}`;
}

function TrafficList({
  rows,
  emptyTitle,
  emptyDescription,
}: {
  rows: Array<{
    label: string;
    visitors: number;
    pageviews: number;
  }>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (rows.length === 0) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const maximumPageviews = Math.max(
    ...rows.map((row) => row.pageviews),
    1
  );

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const width = Math.max(
          (row.pageviews / maximumPageviews) * 100,
          3
        );

        return (
          <li
            key={row.label}
            className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                {row.label}
              </span>

              <span className="shrink-0 text-xs text-text-secondary">
                {row.visitors.toLocaleString()} visitors
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-card">
              <div
                className="h-full rounded-full bg-charcoal"
                style={{ width: `${width}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-text-tertiary">
              {row.pageviews.toLocaleString()} page views
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default function AnalyticsAdminClient({
  analytics,
  vercelAnalytics,
}: {
  analytics: AdminAnalyticsSnapshot;
  vercelAnalytics: AdminVercelAnalyticsSnapshot;
}) {
  const dateRange = formatDateRange(
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

  const maximumDailyViews = Math.max(
    ...vercelAnalytics.dailyTraffic.map(
      (entry) => entry.pageviews
    ),
    1
  );

  return (
    <>
      <AdminPageHero
        title="Analytics"
        description="Live website traffic from Vercel Analytics alongside account, device, subscription, and support activity from Home Tech Vault."
        primaryAction={{
          label: "Open Vercel",
          href: "https://vercel.com/dashboard",
        }}
        badge={
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
              ? `Live traffic · ${dateRange}`
              : vercelAnalytics.configured
                ? "Vercel temporarily unavailable"
                : "Vercel not connected"}
          </AdminStatusBadge>
        }
      />

      {vercelAnalytics.available ? (
        <>
          <AdminSummaryGrid>
            <AdminSummaryCard
              label="Visitors"
              value={vercelAnalytics.visitors}
              hint="Unique visitors in the last 30 days"
              icon={
                <Users
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              }
            />

            <AdminSummaryCard
              label="Page Views"
              value={vercelAnalytics.pageviews}
              hint="Total production page views"
              icon={
                <Eye
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              }
            />

            <AdminSummaryCard
              label="Views per Visitor"
              value={averageViewsPerVisitor}
              hint="Average browsing depth"
              icon={
                <MousePointerClick
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              }
            />

            <AdminSummaryCard
              label="Tracked Pages"
              value={vercelAnalytics.topPages.length}
              hint="Top routes in this report"
              icon={
                <BarChart3
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              }
            />
          </AdminSummaryGrid>

          <AdminContentSection
            id="traffic-trend-heading"
            title="Traffic trend"
            subtitle={`Daily production traffic · ${dateRange}`}
          >
            {vercelAnalytics.dailyTraffic.length ===
            0 ? (
              <AdminEmptyState
                title="No traffic data"
                description="Vercel has not returned daily traffic for this reporting period."
              />
            ) : (
              <div className="overflow-x-auto">
                <div className="flex min-w-[720px] items-end gap-2">
                  {vercelAnalytics.dailyTraffic.map(
                    (entry) => {
                      const height = Math.max(
                        (entry.pageviews /
                          maximumDailyViews) *
                          180,
                        entry.pageviews > 0 ? 8 : 2
                      );

                      return (
                        <div
                          key={entry.date}
                          className="flex min-w-0 flex-1 flex-col items-center"
                        >
                          <div className="flex h-48 w-full items-end justify-center rounded-t-xl bg-surface-sunken px-1">
                            <div
                              className="w-full max-w-8 rounded-t-lg bg-charcoal transition"
                              style={{
                                height: `${height}px`,
                              }}
                              title={`${entry.date}: ${entry.pageviews} page views, ${entry.visitors} visitors`}
                            />
                          </div>

                          <p className="mt-2 text-[10px] text-text-tertiary">
                            {new Date(
                              `${entry.date}T12:00:00Z`
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month: "numeric",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </AdminContentSection>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminContentSection
              id="top-pages-heading"
              title="Top pages"
              subtitle="Routes with the most page views."
            >
              <TrafficList
                rows={vercelAnalytics.topPages}
                emptyTitle="No page data"
                emptyDescription="No page routes were recorded during this period."
              />
            </AdminContentSection>

            <AdminContentSection
              id="traffic-sources-heading"
              title="Traffic sources"
              subtitle="Where visitors arrived from."
            >
              <TrafficList
                rows={vercelAnalytics.topReferrers}
                emptyTitle="No referral data"
                emptyDescription="No referral sources were recorded during this period."
              />
            </AdminContentSection>
          </div>
        </>
      ) : (
        <AdminContentSection
          id="vercel-status-heading"
          title="Vercel Analytics"
          subtitle="Live production traffic"
        >
          <AdminErrorState
            message={
              vercelAnalytics.error ??
              "Vercel Analytics is unavailable."
            }
          />
        </AdminContentSection>
      )}

      <AdminContentSection
        id="product-metrics-heading"
        title="Product activity"
        subtitle="Current Home Tech Vault data from Supabase."
      >
        <AdminSummaryGrid>
          <AdminSummaryCard
            label="Users"
            value={analytics.totalUsers}
            icon={
              <Users
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />

          <AdminSummaryCard
            label="Devices"
            value={analytics.totalDevices}
            icon={
              <HardDrive
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />

          <AdminSummaryCard
            label="Documents"
            value={analytics.totalDocuments}
            icon={
              <FileText
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />

          <AdminSummaryCard
            label="Open Support"
            value={analytics.openSupportTickets}
            icon={
              <Activity
                aria-hidden="true"
                className="h-5 w-5"
              />
            }
          />
        </AdminSummaryGrid>
      </AdminContentSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminContentSection
          id="reports-signups-heading"
          title="Signups by day"
          subtitle="Profile creations over the last 30 days."
        >
          {analytics.signupsByDay.length === 0 ? (
            <AdminEmptyState
              title="No signup data"
              description="No profiles were created during this period."
            />
          ) : (
            <ul className="space-y-2">
              {analytics.signupsByDay.map(
                (entry) => (
                  <li
                    key={entry.date}
                    className="flex items-center justify-between rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm"
                  >
                    <span className="text-text-secondary">
                      {entry.date}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {entry.count}
                    </span>
                  </li>
                )
              )}
            </ul>
          )}
        </AdminContentSection>

        <AdminContentSection
          id="reports-plans-heading"
          title="Plan distribution"
          subtitle="Current subscription plan counts."
        >
          <ul className="space-y-2">
            {analytics.planDistribution.map(
              (entry) => (
                <li
                  key={entry.plan}
                  className="flex items-center justify-between rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm"
                >
                  <span className="capitalize text-text-primary">
                    {entry.plan}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {entry.count}
                  </span>
                </li>
              )
            )}
          </ul>
        </AdminContentSection>
      </div>

      <AdminContentSection
        id="reports-external-heading"
        title="External dashboards"
        subtitle="Open connected services in a new tab."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXTERNAL_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4 transition hover:bg-surface-card"
              >
                <span className="font-medium text-text-primary">
                  {link.label}
                </span>

                <ExternalLink
                  aria-hidden="true"
                  className="h-4 w-4 text-text-tertiary transition group-hover:text-charcoal"
                />
              </Link>
            </li>
          ))}
        </ul>
      </AdminContentSection>
    </>
  );
}
