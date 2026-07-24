"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHero,
  AdminSearchField,
  AdminSearchFilters,
} from "@/components/admin/layout/AdminPageLayout";
import AdminFilterPills from "@/components/admin/ui/AdminFilterPills";
import AdminStatusChip from "@/components/admin/ui/AdminStatusChip";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminActivityEvent } from "@/lib/admin/controlCenterTypes";

const FILTER_OPTIONS = [
  { id: "", label: "All" },
  { id: "user_created", label: "Signups" },
  { id: "invitation_sent", label: "Invitations" },
  { id: "subscription_upgraded", label: "Upgrades" },
  { id: "user_suspended", label: "Suspensions" },
  { id: "connector_installed", label: "Connectors" },
];

export default function ActivityAdminClient() {
  const [events, setEvents] = useState<
    AdminActivityEvent[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (kind) {
        params.set("kind", kind);
      }

      const response = await fetch(
        `/api/admin/activity?${params.toString()}`,
        { cache: "no-store" }
      );

      const payload = (await response.json()) as {
        events?: AdminActivityEvent[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to load activity."
        );
      }

      setEvents(payload.events ?? []);
    } catch (loadError) {
      setEvents([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load activity."
      );
    } finally {
      setLoading(false);
    }
  }, [search, kind]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEvents();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadEvents]);

  const filteredEvents = useMemo(() => events, [events]);

  return (
    <>
      <AdminPageHero
        title="Platform Activity"
        description="Searchable timeline of signups, invitations, admin actions, connector events, and subscription changes."
      />

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search activity"
        />
      </AdminSearchFilters>

      <AdminFilterPills
        options={FILTER_OPTIONS}
        value={kind}
        onChange={setKind}
      />

      <AdminContentSection title="Timeline">
        {loading ? (
          <AdminLoadingState label="Loading activity…" />
        ) : error ? (
          <AdminErrorState message={error} />
        ) : filteredEvents.length === 0 ? (
          <AdminEmptyState
            title="No activity yet"
            description="Platform events will appear here as users join, upgrade, and interact."
          />
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-[20px] border border-border-subtle bg-surface-sunken/40 p-4 transition hover:border-border-strong"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-text-primary">
                        {event.title}
                      </h3>
                      <AdminStatusChip tone="neutral" dot={false}>
                        {event.kind.replace(/_/g, " ")}
                      </AdminStatusChip>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {event.description}
                    </p>
                    {event.targetLabel ? (
                      <p className="mt-2 text-xs text-text-tertiary">
                        Target: {event.targetLabel}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {formatAdminDate(event.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminContentSection>
    </>
  );
}
