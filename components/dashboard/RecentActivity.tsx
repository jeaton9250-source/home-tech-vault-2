"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import ActivityTimeline from "@/components/activity/ActivityTimeline";
import PageCard from "@/components/ui/PageCard";

import { useActivityFeed } from "@/hooks/useActivityFeed";

type RecentActivityProps = {
  limit?: number;
  deviceId?: string;
  title?: string;
  viewAllHref?: string;
};

export default function RecentActivity({
  limit = 5,
  deviceId,
  title = "Recent Activity",
  viewAllHref = "/activity",
}: RecentActivityProps) {
  const { events, loading } =
    useActivityFeed({
      limit,
      deviceId,
    });

  return (
    <PageCard interactive>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-overline">
            Activity Timeline
          </p>

          <h2 className="text-section-title mt-2 text-text-primary">
            {title}
          </h2>
        </div>

        {!deviceId && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="mt-6">
        <ActivityTimeline
          events={events}
          loading={loading}
          compact
          showActor={!deviceId}
        />
      </div>
    </PageCard>
  );
}
