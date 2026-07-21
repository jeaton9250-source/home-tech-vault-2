import Link from "next/link";

import AdminPanel, {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type { FoundingMembersDashboardMetrics } from "@/lib/founding-members/types";

type FoundingMembersDashboardCardProps = {
  metrics: FoundingMembersDashboardMetrics | null;
};

export default function FoundingMembersDashboardCard({
  metrics,
}: FoundingMembersDashboardCardProps) {
  if (!metrics) {
    return (
      <AdminPanel title="Founding Members">
        <p className="text-sm text-text-secondary">
          Founding Members program data is
          unavailable until the migration is
          applied.
        </p>
      </AdminPanel>
    );
  }

  const enrolledCount =
    metrics.capacity - metrics.remainingSpots;
  const progressPercent =
    metrics.capacity > 0
      ? Math.min(
          100,
          Math.round(
            (enrolledCount / metrics.capacity) *
              100
          )
        )
      : 0;

  return (
    <AdminPanel title="Founding Members">
      <div className="space-y-4">
        <div>
          <p className="text-sm capitalize text-text-secondary">
            Program status: {metrics.programStatus}
          </p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {enrolledCount} of {metrics.capacity}{" "}
            enrolled
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {metrics.remainingSpots} spots remaining
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm">
            <p className="text-text-secondary">
              Complimentary Pro grants linked
            </p>
            <p className="mt-1 font-semibold text-text-primary">
              {metrics.linkedGrantCount}
            </p>
          </div>
          <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm">
            <p className="text-text-secondary">
              Members with paid plans
            </p>
            <p className="mt-1 font-semibold text-text-primary">
              {metrics.paidPlanCount}
            </p>
          </div>
        </div>

        {metrics.latestMemberNumber ? (
          <p className="text-sm text-text-secondary">
            Latest: Member #
            {metrics.latestMemberNumber}
            {metrics.latestEnrollmentDate
              ? ` · ${formatAdminDate(metrics.latestEnrollmentDate)}`
              : null}
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            No enrollments yet.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/founding-members">
            <Button
              type="button"
              variant="secondary"
            >
              View members
            </Button>
          </Link>
          <Link href="/admin/founding-members">
            <Button type="button" variant="ghost">
              Manage settings
            </Button>
          </Link>
        </div>
      </div>
    </AdminPanel>
  );
}
