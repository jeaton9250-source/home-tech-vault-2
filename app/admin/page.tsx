import Link from "next/link";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FoundingMembersDashboardCard from "@/components/admin/founding-members/FoundingMembersDashboardCard";
import AdminPanel, {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { loadFoundingMembersDashboardMetrics } from "@/lib/admin/data/foundingMembers";
import { loadAdminDashboardMetrics } from "@/lib/admin/data/dashboard";

export const metadata = {
  title: "Platform Overview — Home Tech Vault Admin",
};

export default async function AdminDashboardPage() {
  const [metrics, foundingMetricsResult] =
    await Promise.all([
      loadAdminDashboardMetrics(),
      loadFoundingMembersDashboardMetrics().catch(
        () => null
      ),
    ]);

  return (
    <>
      <AdminPageHeader
        title="Platform Overview"
        description="Operational summary for users, subscriptions, households, and support activity."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total users"
          value={metrics.totalUsers}
        />
        <AdminStatCard
          label="New today"
          value={metrics.newUsersToday}
        />
        <AdminStatCard
          label="New this week"
          value={metrics.newUsersThisWeek}
        />
        <AdminStatCard
          label="Active subscriptions"
          value={metrics.activeSubscriptions}
        />
        <AdminStatCard
          label="Free users"
          value={metrics.freeUsers}
        />
        <AdminStatCard
          label="Pro users"
          value={metrics.proUsers}
        />
        <AdminStatCard
          label="Family users"
          value={metrics.familyUsers}
        />
        <AdminStatCard
          label="Households"
          value={metrics.totalHouseholds}
        />
        <AdminStatCard
          label="Open support tickets"
          value={metrics.openSupportTickets}
        />
        <AdminStatCard
          label="New tickets today"
          value={metrics.newSupportTickets}
        />
      </section>

      {metrics.systemWarnings.length > 0 && (
        <AdminPanel
          title="System warnings"
          className="mt-6"
        >
          <ul className="space-y-2 text-sm leading-6 text-warning">
            {metrics.systemWarnings.map(
              (warning) => (
                <li key={warning}>{warning}</li>
              )
            )}
          </ul>
        </AdminPanel>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <FoundingMembersDashboardCard
          metrics={foundingMetricsResult}
        />

        <AdminPanel title="Recent signups">
          <div className="space-y-3">
            {metrics.recentSignups.length ===
            0 ? (
              <p className="text-sm text-text-secondary">
                No recent signups.
              </p>
            ) : (
              metrics.recentSignups.map(
                (signup) => (
                  <div
                    key={signup.id}
                    className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                  >
                    <p className="font-medium text-text-primary">
                      {signup.fullName ||
                        signup.email ||
                        signup.id}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {formatAdminDate(
                        signup.createdAt
                      )}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Recent upgrades">
          <div className="space-y-3">
            {metrics.recentUpgrades.length ===
            0 ? (
              <p className="text-sm text-text-secondary">
                No recent paid plan activity.
              </p>
            ) : (
              metrics.recentUpgrades.map(
                (upgrade) => (
                  <div
                    key={`${upgrade.userId}-${upgrade.updatedAt}`}
                    className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                  >
                    <p className="font-medium capitalize text-text-primary">
                      {upgrade.plan} ·{" "}
                      {upgrade.status}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {upgrade.email ||
                        upgrade.userId}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {formatAdminDate(
                        upgrade.updatedAt
                      )}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Recent support activity">
          <div className="space-y-3">
            {metrics.recentSupportActivity
              .length === 0 ? (
              <p className="text-sm text-text-secondary">
                No support tickets yet.
              </p>
            ) : (
              metrics.recentSupportActivity.map(
                (ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/support/${ticket.id}`}
                    className="block rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 transition hover:bg-[#EEEAE1]"
                  >
                    <p className="font-medium text-text-primary">
                      {ticket.ticketNumber}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 text-xs capitalize text-text-tertiary">
                      {ticket.status.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </Link>
                )
              )
            )}
          </div>
        </AdminPanel>
      </section>
    </>
  );
}
