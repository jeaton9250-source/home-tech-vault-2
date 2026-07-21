"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Download,
  Loader2,
  Search,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel, {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type {
  FoundingMemberAdminRow,
  FoundingMembersDashboardMetrics,
} from "@/lib/founding-members/types";

type FoundingMembersAdminClientProps = {
  initialMetrics?: FoundingMembersDashboardMetrics;
  initialMembers?: FoundingMemberAdminRow[];
};

export default function FoundingMembersAdminClient({
  initialMetrics,
  initialMembers,
}: FoundingMembersAdminClientProps = {}) {
  const [metrics, setMetrics] =
    useState<FoundingMembersDashboardMetrics | null>(
      initialMetrics ?? null
    );
  const [members, setMembers] =
    useState<FoundingMemberAdminRow[]>(
      initialMembers ?? []
    );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "removed">(
      "active"
    );
  const [loading, setLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] =
    useState("");

  const progressPercent = useMemo(() => {
    if (!metrics || metrics.capacity <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        ((metrics.capacity -
          metrics.remainingSpots) /
          metrics.capacity) *
          100
      )
    );
  }, [metrics]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/admin/founding-members?${params.toString()}`
      );
      const payload =
        (await response.json()) as {
          members?: FoundingMemberAdminRow[];
          metrics?: FoundingMembersDashboardMetrics;
        };

      if (response.ok) {
        setMembers(payload.members ?? []);
        if (payload.metrics) {
          setMetrics(payload.metrics);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, initialMetrics ? 250 : 0);

    return () => window.clearTimeout(timer);
  }, [refresh, initialMetrics]);

  if (!metrics) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-text-secondary">
        <Loader2
          size={16}
          className="animate-spin"
        />
        Loading founding members...
      </div>
    );
  }

  async function updateProgramSettings(
    update: Record<string, unknown>
  ) {
    setSettingsMessage("");

    const response = await fetch(
      "/api/admin/founding-members",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...update,
          confirm: true,
        }),
      }
    );

    const payload =
      (await response.json()) as {
        error?: string;
        metrics?: FoundingMembersDashboardMetrics;
      };

    if (!response.ok) {
      setSettingsMessage(
        payload.error ||
          "Unable to update program settings."
      );
      return;
    }

    if (payload.metrics) {
      setMetrics(payload.metrics);
    }

    setSettingsMessage("Program settings updated.");
    await refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Founding Members"
        description="Manage the first 50 Home Tech Vault Founding Members and complimentary Pro enrollment."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminPanel title="Program status">
          <div className="space-y-4">
            <div>
              <p className="text-sm capitalize text-text-secondary">
                {metrics.programStatus}
              </p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {metrics.capacity -
                  metrics.remainingSpots}{" "}
                of {metrics.capacity} enrolled
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {metrics.remainingSpots} spots
                remaining
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
              <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  Active members
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {metrics.activeCount}
                </p>
              </div>
              <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  Linked Pro grants
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {metrics.linkedGrantCount}
                </p>
              </div>
              <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  Paid plan members
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {metrics.paidPlanCount}
                </p>
              </div>
              <div className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  Latest enrollment
                </p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {metrics.latestMemberNumber
                    ? `#${metrics.latestMemberNumber}`
                    : "None yet"}
                </p>
                {metrics.latestEnrollmentDate ? (
                  <p className="mt-1 text-xs text-text-tertiary">
                    {formatAdminDate(
                      metrics.latestEnrollmentDate
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Program controls">
          <div className="space-y-3">
            <p className="text-sm leading-6 text-text-secondary">
              {metrics.settings.publicMessage}
            </p>

            <div className="flex flex-wrap gap-2">
              {metrics.programStatus ===
              "paused" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void updateProgramSettings({
                      enabled: true,
                    })
                  }
                >
                  Resume program
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void updateProgramSettings({
                      enabled: false,
                    })
                  }
                >
                  Pause program
                </Button>
              )}
            </div>

            {settingsMessage ? (
              <p className="text-sm text-text-secondary">
                {settingsMessage}
              </p>
            ) : null}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        title="Members"
        className="mt-6"
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, or number"
              className="w-full rounded-full border border-border-subtle bg-surface-sunken py-2 pl-9 pr-3 text-sm"
            />
          </label>

          <div className="flex items-center gap-3">
            <a
              href={`/api/admin/founding-members?format=csv&status=${statusFilter}${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ""}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              <Download size={16} />
              Export CSV
            </a>

            <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as typeof statusFilter
              )
            }
            className="rounded-full border border-border-subtle bg-surface-sunken px-4 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="removed">Removed</option>
            <option value="all">All</option>
          </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-text-secondary">
            <Loader2
              size={16}
              className="animate-spin"
            />
            Refreshing members...
          </div>
        ) : members.length === 0 ? (
          <p className="py-8 text-sm text-text-secondary">
            No founding members match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-tertiary">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">
                    Enrolled
                  </th>
                  <th className="px-3 py-3">
                    Effective
                  </th>
                  <th className="px-3 py-3">
                    Billing
                  </th>
                  <th className="px-3 py-3">
                    Grant
                  </th>
                  <th className="px-3 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border-subtle/70"
                  >
                    <td className="px-3 py-3 font-medium">
                      {member.memberNumber}
                    </td>
                    <td className="px-3 py-3">
                      {member.fullName || "—"}
                    </td>
                    <td className="px-3 py-3">
                      {member.email || "—"}
                    </td>
                    <td className="px-3 py-3">
                      {formatAdminDate(
                        member.enrolledAt
                      )}
                    </td>
                    <td className="px-3 py-3 capitalize">
                      {member.effectivePlan}
                    </td>
                    <td className="px-3 py-3 capitalize">
                      {member.billingPlan}
                    </td>
                    <td className="px-3 py-3">
                      {member.grantPlan
                        ? `${member.grantPlan} · ${member.grantStatus}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 capitalize">
                      <Link
                        href={`/admin/users?selected=${member.userId}`}
                        className="text-accent hover:underline"
                      >
                        {member.status}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </>
  );
}
