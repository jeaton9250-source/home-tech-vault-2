"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel, {
  AdminEmptyState,
} from "@/components/admin/AdminPanel";
import AdminStatCard from "@/components/admin/AdminStatCard";
import Button from "@/components/ui/Button";
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
      <AdminPageHeader
        title="Analytics"
        description="Supabase-derived product metrics. External analytics dashboards open separately."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total users"
          value={analytics.totalUsers}
        />
        <AdminStatCard
          label="Households"
          value={analytics.totalHouseholds}
        />
        <AdminStatCard
          label="Devices"
          value={analytics.totalDevices}
        />
        <AdminStatCard
          label="Documents"
          value={analytics.totalDocuments}
        />
        <AdminStatCard
          label="Support tickets"
          value={analytics.totalSupportTickets}
        />
        <AdminStatCard
          label="Open support"
          value={analytics.openSupportTickets}
        />
        <AdminStatCard
          label="Family invitations"
          value={analytics.familyInvitationsTotal}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Signups by day (30 days)">
          {analytics.signupsByDay.length === 0 ? (
            <AdminEmptyState
              title="No signup data"
              description="No profile records were created in the last 30 days."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={analytics.signupsByDay}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#1C1917"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Plan distribution">
          <div className="space-y-3">
            {analytics.planDistribution.map(
              (entry) => (
                <div
                  key={entry.plan}
                  className="flex items-center justify-between rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                >
                  <span className="capitalize text-text-primary">
                    {entry.plan}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {entry.count}
                  </span>
                </div>
              )
            )}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        title="External analytics"
        className="mt-6"
      >
        <div className="flex flex-wrap gap-3">
          {EXTERNAL_LINKS.map((link) => (
            <Button
              key={link.label}
              href={link.href}
              variant="secondary"
            >
              {link.label}
            </Button>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Deferred metrics"
        className="mt-6"
      >
        <ul className="space-y-2 text-sm leading-6 text-text-secondary">
          {analytics.deferredMetrics.map(
            (metric) => (
              <li key={metric}>{metric}</li>
            )
          )}
        </ul>
      </AdminPanel>
    </>
  );
}
