"use client";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import ActivityTimeline from "@/components/activity/ActivityTimeline";

import { useActivityFeed } from "@/hooks/useActivityFeed";
import { usePermissions } from "@/hooks/usePermissions";

export default function HouseholdActivityPage() {
  const { isDemo } = usePermissions();

  const { events, loading, errorMessage } =
    useActivityFeed({
      limit: 100,
    });

  return (
    <PageShell>
      <PageTitle
        section="neutral"
        eyebrow="Household Activity"
        title="Activity Timeline"
        description="Recent actions derived from your vault records and network scans."
      />

      {isDemo && (
        <PageCard className="border-warning/40 bg-warning-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
            Demo Activity
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            Sample events show how device updates and
            network scans appear in the activity timeline.
          </p>
        </PageCard>
      )}

      {!isDemo && !loading && (
        <PageCard className="border-border-subtle bg-surface-sunken/60">
          <p className="text-sm text-text-secondary">
            Activity is derived from device timeline
            events and recent network scans. It is not a
            permanent household audit log yet.
          </p>
        </PageCard>
      )}

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <PageCard className="p-6 md:p-8">
        <ActivityTimeline
          events={events}
          loading={loading}
        />
      </PageCard>
    </PageShell>
  );
}
