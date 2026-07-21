"use client";

import Link from "next/link";

import {
  CalendarDays,
  Loader2,
} from "lucide-react";

import {
  getActivityIcon,
  getActivityTypeLabel,
} from "@/lib/activity";

import type { VaultActivityEvent } from "@/lib/activity/types";

type ActivityTimelineProps = {
  events: VaultActivityEvent[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  compact?: boolean;
  showActor?: boolean;
};

export default function ActivityTimeline({
  events,
  loading = false,
  emptyTitle = "No activity yet",
  emptyDescription =
    "Device updates and network scans from your vault will appear here.",
  compact = false,
  showActor = true,
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface-sunken p-6 text-text-secondary">
        <Loader2
          size={20}
          className="animate-spin"
        />
        Loading activity...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border-subtle bg-surface-base p-8 text-center">
        <p className="font-medium text-text-primary">
          {emptyTitle}
        </p>

        <p className="mt-2 text-sm text-text-secondary">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative space-y-4 ${
        compact
          ? ""
          : "before:absolute before:bottom-3 before:left-[21px] before:top-3 before:w-px before:bg-border-subtle"
      }`}
    >
      {events.map((event) => {
        const Icon = getActivityIcon(
          event.activityType
        );

        const content = (
          <div
            className={`relative flex items-start gap-4 ${
              compact ? "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-4" : ""
            }`}
          >
            <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-charcoal text-surface-card shadow-sm">
              <Icon size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-overline">
                {getActivityTypeLabel(
                  event.activityType
                )}
              </p>

              <h3 className="mt-1 font-medium text-text-primary">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {event.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {formatActivityDate(
                    event.occurredAt
                  )}
                </span>

                {showActor &&
                  event.userDisplayName && (
                    <span>
                      by{" "}
                      {event.userDisplayName}
                    </span>
                  )}
              </div>
            </div>
          </div>
        );

        if (event.deviceId) {
          return (
            <Link
              key={event.id}
              href={`/devices/${event.deviceId}`}
              className="block transition hover:opacity-90"
            >
              {content}
            </Link>
          );
        }

        return (
          <div key={event.id}>{content}</div>
        );
      })}
    </div>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
