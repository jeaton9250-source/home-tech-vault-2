"use client";

import Link from "next/link";
import {
  Activity,
  ExternalLink,
  FileText,
  HardDrive,
  Users,
} from "lucide-react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminPageHero,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import type { AdminAnalyticsSnapshot } from "@/lib/admin/types";

const EXTERNAL_LINKS = [
  {
    label: "Google Analytics",
    href: "https://analytics.google.com/",
  },
  {
    label: "Search Console",
    href: "https://search.google.com/search-console",
  },
  {
    label: "Vercel Analytics",
    href: "https://vercel.com/dashboard",
  },
  {
    label: "Resend",
    href: "https://resend.com/emails",
  },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard",
  },
  {
    label: "Stripe",
    href: "https://dashboard.stripe.com/",
  },
];

export default function AnalyticsAdminClient({
  analytics,
}: {
  analytics: AdminAnalyticsSnapshot;
}) {
  return (
    <>
      <AdminPageHero
        title="Reports"
        description="Platform inventory and signup trends from Supabase. External dashboards open separately."
        primaryAction={{
          label: "Open Stripe",
          href: "https://dashboard.stripe.com/",
        }}
      />

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
          label="Open support"
          value={analytics.openSupportTickets}
          icon={
            <Activity
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
      </AdminSummaryGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminContentSection
          id="reports-signups-heading"
          title="Signups by day"
          subtitle="Profile creations over the last 30 days."
        >
          {analytics.signupsByDay.length === 0 ? (
            <AdminEmptyState
              title="No signup data"
              description="No profile records were created in the last 30 days."
            />
          ) : (
            <ul className="space-y-2">
              {analytics.signupsByDay.map((entry) => (
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
              ))}
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
        title="External analytics"
        subtitle="Open third-party dashboards in a new tab."
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

      <AdminContentSection
        id="reports-deferred-heading"
        title="Deferred metrics"
        subtitle="Metrics not yet tracked in the platform database."
      >
        <ul className="space-y-2 text-sm leading-6 text-text-secondary">
          {analytics.deferredMetrics.map(
            (metric) => (
              <li
                key={metric}
                className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
              >
                {metric}
              </li>
            )
          )}
        </ul>
      </AdminContentSection>
    </>
  );
}
