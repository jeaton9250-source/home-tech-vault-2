"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ActivityTimeline from "@/components/activity/ActivityTimeline";
import { useActivityFeed } from "@/hooks/useActivityFeed";

type DashboardRecentActivityProps = {
  limit?: number;
};

export default function DashboardRecentActivity({
  limit = 5,
}: DashboardRecentActivityProps) {
  const { events, loading } =
    useActivityFeed({ limit });

  return (
    <section aria-label="Recent activity">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-overline text-text-muted">
          Recent Activity
        </h2>

        <Link
          href="/activity"
          className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
        >
          View all
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <div className="mt-4">
        <ActivityTimeline
          events={events}
          loading={loading}
          compact
          showActor
        />
      </div>
    </section>
  );
}
