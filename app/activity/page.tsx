"use client";

import Link from "next/link";

import { useMemo, type ComponentType } from "react";

import {
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  History,
  Loader2,
  RefreshCw,
  Wifi,
} from "lucide-react";

import PageHero from "@/components/ui/PageHero";
import PageShell from "@/components/ui/PageShell";

import { getActivityIcon, getActivityTypeLabel } from "@/lib/activity";

import type { VaultActivityEvent } from "@/lib/activity/types";

import { useActivityFeed } from "@/hooks/useActivityFeed";

import { usePermissions } from "@/hooks/usePermissions";

type GroupedActivity = {
  label: string;
  events: VaultActivityEvent[];
};

export default function HouseholdActivityPage() {
  const { isDemo } = usePermissions();

  const { events, loading, errorMessage, reload } = useActivityFeed({
    limit: 100,
  });

  /*
   * We preserve every database record.
   *
   * This is display-only cleanup for connector events
   * that can be emitted multiple times with the same
   * device/title/timestamp.
   */
  const visibleEvents = useMemo(
    () => collapseDuplicateActivity(events),
    [events],
  );

  const hiddenRepeatCount = Math.max(0, events.length - visibleEvents.length);

  const groupedEvents = useMemo(
    () => groupActivityByDate(visibleEvents),
    [visibleEvents],
  );

  return (
    <PageShell className="bg-[#f7f6f2]">
      <PageHero
        eyebrow="Household Activity"
        title="Activity"
        description="See recent changes across your devices, documents, maintenance, and Home Wi-Fi."
      >
        <button
          type="button"
          onClick={() => {
            void reload();
          }}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] border border-[#e4e2dc] bg-[#fffefa] px-4 text-[13px] font-semibold text-[#52606a] transition hover:border-[#718d4f]/35 hover:bg-[#f8f6f0] hover:text-[#526b39] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </PageHero>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-[#829078]">
        {!loading ? (
          <>
            <span>
              {visibleEvents.length}{" "}
              {visibleEvents.length === 1 ? "event" : "events"}
            </span>

            {hiddenRepeatCount > 0 ? (
              <>
                <span className="text-[#c2c8bc]">•</span>

                <span>
                  {hiddenRepeatCount}{" "}
                  {hiddenRepeatCount === 1 ? "repeat" : "repeats"} condensed
                </span>
              </>
            ) : null}

            <span className="text-[#c2c8bc]">•</span>

            <span>Latest household changes</span>
          </>
        ) : null}
      </div>

      {isDemo ? (
        <div className="rounded-[18px] border border-[#dbe3d2] bg-[#eef2e8] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            Demo Activity
          </p>

          <p className="mt-1.5 text-sm leading-6 text-[#68737b]">
            These events belong to the sample household used in Demo Mode.
          </p>
        </div>
      ) : null}

      {!isDemo && !loading ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-[#e4e2dc] bg-[#f4f1ea]/65 px-4 py-3.5">
          <History size={16} className="mt-0.5 shrink-0 text-[#718d4f]" />

          <p className="text-[12px] leading-5 text-[#68737b]">
            Activity is assembled from device timeline events and recent Home
            Wi-Fi scans. It is a helpful recent-history view, not a permanent
            audit log.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-[18px] border border-[#a6584e]/20 bg-[#a6584e]/8 px-5 py-4">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#a6584e]" />

          <div>
            <p className="text-sm font-semibold text-[#17212a]">
              Activity could not be refreshed.
            </p>

            <p className="mt-1 text-xs leading-5 text-[#68737b]">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-[#e4e2dc] bg-[#fffefa] shadow-[0_1px_2px_rgba(23,33,42,0.025)]">
        {loading ? (
          <ActivityLoading />
        ) : visibleEvents.length === 0 ? (
          <ActivityEmpty />
        ) : (
          <div>
            {groupedEvents.map((group) => (
              <ActivityGroup key={group.label} group={group} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function ActivityGroup({ group }: { group: GroupedActivity }) {
  return (
    <section>
      <div className="border-b border-[#e9e7e1] bg-[#f8f6f0] px-5 py-3.5 md:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#819174]">
          {group.label}
        </p>
      </div>

      <div className="divide-y divide-[#eceae4]">
        {group.events.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({ event }: { event: VaultActivityEvent }) {
  const isNetwork = isNetworkActivity(event);

  const Icon: ComponentType<{
    size?: number;
    className?: string;
  }> = isNetwork ? Wifi : getActivityIcon(event.activityType);

  const typeLabel = isNetwork
    ? "Home Wi-Fi"
    : getActivityTypeLabel(event.activityType);

  const content = (
    <div className="group flex items-start gap-4 px-5 py-4 transition hover:bg-[#faf9f6] md:px-6 md:py-[18px]">
      <div
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] " +
          (isNetwork
            ? "bg-[#eef2e8] text-[#617c43]"
            : activityTone(event.activityType))
        }
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#819174]">
              {typeLabel}
            </p>

            <h3 className="mt-1.5 text-[14px] font-semibold tracking-[-0.015em] text-[#17212a]">
              {event.title}
            </h3>

            {event.description ? (
              <p className="mt-1.5 max-w-3xl text-[12px] leading-5 text-[#68737b]">
                {event.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 text-[11px] text-[#929b9f]">
            <Clock3 size={13} />

            {formatActivityDate(event.occurredAt)}
          </div>
        </div>

        {event.userDisplayName ? (
          <p className="mt-2 text-[10px] text-[#a0a7a9]">
            by {event.userDisplayName}
          </p>
        ) : null}
      </div>

      {event.deviceId ? (
        <ChevronRight
          size={15}
          className="mt-3 shrink-0 text-[#c0c8b9] transition group-hover:text-[#617c43]"
        />
      ) : null}
    </div>
  );

  if (event.deviceId) {
    return (
      <Link href={`/devices/${event.deviceId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function ActivityLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[#68737b]">
        <Loader2 size={19} className="animate-spin text-[#617c43]" />
        Loading activity...
      </div>
    </div>
  );
}

function ActivityEmpty() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#eef2e8] text-[#617c43]">
        <History size={20} />
      </div>

      <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.025em] text-[#17212a]">
        No activity yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68737b]">
        Device changes and Home Wi-Fi activity will appear here as your Vault
        begins building history.
      </p>
    </div>
  );
}

function collapseDuplicateActivity(events: VaultActivityEvent[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    const date = new Date(event.occurredAt);

    const timestamp = Number.isNaN(date.getTime())
      ? event.occurredAt
      : String(Math.floor(date.getTime() / (15 * 60 * 1000)));

    /*
     * Connector "returned to network"
     * events can occasionally be emitted
     * multiple times for the same device
     * during one observation window.
     *
     * For that event we intentionally
     * ignore tiny description differences
     * and collapse within a 15-minute
     * display bucket.
     */
    const networkReturn = isDeviceReturnEvent(event);

    const signature = [
      networkReturn ? "device-return" : normalizeText(event.activityType),

      normalizeText(event.title),

      event.deviceId || "no-device",

      networkReturn ? "" : normalizeText(event.description || ""),

      timestamp,
    ].join("|");

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);

    return true;
  });
}

function isDeviceReturnEvent(event: VaultActivityEvent) {
  const title = normalizeText(event.title);

  return (
    title.includes("returned to the network") ||
    title.includes("returned to network")
  );
}

function isNetworkActivity(event: VaultActivityEvent) {
  const title = normalizeText(event.title);

  const description = normalizeText(event.description || "");

  return (
    event.activityType === "network.scan.completed" ||
    title.includes("network") ||
    description.includes("connector observed") ||
    description.includes("network scan")
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function groupActivityByDate(events: VaultActivityEvent[]): GroupedActivity[] {
  const groups = new Map<string, VaultActivityEvent[]>();

  for (const event of events) {
    const label = activityDateGroup(event.occurredAt);

    const existing = groups.get(label) || [];

    existing.push(event);

    groups.set(label, existing);
  }

  return Array.from(groups.entries()).map(([label, groupEvents]) => ({
    label,
    events: groupEvents,
  }));
}

function activityDateGroup(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Earlier";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(date);

  eventDay.setHours(0, 0, 0, 0);

  const differenceDays = Math.round(
    (today.getTime() - eventDay.getTime()) / 86400000,
  );

  if (differenceDays === 0) {
    return "Today";
  }

  if (differenceDays === 1) {
    return "Yesterday";
  }

  if (differenceDays > 1 && differenceDays < 7) {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();

  const sameDay = date.toDateString() === today.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function activityTone(activityType: string) {
  if (activityType.includes("warranty")) {
    return "bg-[#eef2e8] text-[#617c43]";
  }

  if (activityType.includes("maintenance")) {
    return "bg-[#f4efe4] text-[#9b7137]";
  }

  if (
    activityType.includes("document") ||
    activityType.includes("receipt") ||
    activityType.includes("photo")
  ) {
    return "bg-[#f1eee7] text-[#617c43]";
  }

  return "bg-[#eef2e8] text-[#617c43]";
}
