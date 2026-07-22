"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Download } from "lucide-react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminFilterSelect,
  AdminList,
  AdminListItem,
  AdminLoadingState,
  AdminPageHero,
  AdminSearchField,
  AdminSearchFilters,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
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
    useState<"" | "active" | "removed">(
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

      if (statusFilter) {
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
    return <AdminLoadingState label="Loading founding members…" />;
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

  const exportHref = `/api/admin/founding-members?format=csv&status=${statusFilter}${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ""}`;

  return (
    <>
      <AdminPageHero
        title="Founding Members"
        description="Manage the first 50 Home Tech Vault Founding Members and complimentary Pro enrollment."
        badge={
          <AdminStatusBadge
            tone={
              metrics.programStatus === "paused"
                ? "warning"
                : "success"
            }
          >
            {metrics.programStatus}
          </AdminStatusBadge>
        }
        primaryAction={{
          label: "Export CSV",
          href: exportHref,
        }}
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Enrolled"
          value={metrics.capacity - metrics.remainingSpots}
          hint={`${metrics.remainingSpots} spots left`}
        />
        <AdminSummaryCard
          label="Active members"
          value={metrics.activeCount}
        />
        <AdminSummaryCard
          label="Linked Pro grants"
          value={metrics.linkedGrantCount}
        />
        <AdminSummaryCard
          label="Paid plan members"
          value={metrics.paidPlanCount}
        />
      </AdminSummaryGrid>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminContentSection
          id="founding-status-heading"
          title="Program status"
          subtitle="Enrollment progress and program availability."
        >
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                {metrics.capacity -
                  metrics.remainingSpots}{" "}
                of {metrics.capacity} enrolled
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {metrics.remainingSpots} spots remaining
                {metrics.latestMemberNumber
                  ? ` · Latest #${metrics.latestMemberNumber}`
                  : ""}
              </p>
              {metrics.latestEnrollmentDate ? (
                <p className="mt-1 text-xs text-text-tertiary">
                  Last enrollment{" "}
                  {formatAdminDate(
                    metrics.latestEnrollmentDate
                  )}
                </p>
              ) : null}
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <p className="text-sm leading-6 text-text-secondary">
              {metrics.settings.publicMessage}
            </p>
          </div>
        </AdminContentSection>

        <AdminContentSection
          id="founding-controls-heading"
          title="Program controls"
          subtitle="Pause or resume founding member enrollment."
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {metrics.programStatus === "paused" ? (
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
        </AdminContentSection>
      </section>

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or number"
        />
        <AdminFilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(
              value as typeof statusFilter
            )
          }
          options={[
            { value: "active", label: "Active" },
            { value: "removed", label: "Removed" },
          ]}
        />
        <div className="flex items-end">
          <a
            href={exportHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm font-medium text-text-primary shadow-[var(--shadow-sm)] transition hover:bg-surface-sunken"
          >
            <Download size={16} />
            Export CSV
          </a>
        </div>
      </AdminSearchFilters>

      <AdminContentSection
        id="founding-members-heading"
        title="Members"
        subtitle="Founding member roster and enrollment details."
      >
        {loading ? (
          <AdminLoadingState label="Refreshing members…" />
        ) : members.length === 0 ? (
          <AdminEmptyState
            title="No founding members found"
            description="Try a different search or status filter."
          />
        ) : (
          <AdminList>
            {members.map((member) => (
              <AdminListItem key={member.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-medium text-text-primary">
                      #{member.memberNumber}{" "}
                      {member.fullName || "Unnamed member"}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {member.email || "No email on file"}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2 lg:text-right">
                    <p className="capitalize text-text-primary">
                      {member.effectivePlan} plan ·{" "}
                      {member.billingPlan} billing
                    </p>
                    <p className="text-text-secondary">
                      Enrolled{" "}
                      {formatAdminDate(member.enrolledAt)}
                    </p>
                    <p className="text-text-secondary">
                      {member.grantPlan
                        ? `${member.grantPlan} grant · ${member.grantStatus}`
                        : "No grant linked"}
                    </p>
                    <p>
                      <Link
                        href={`/admin/users?selected=${member.userId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        View user · {member.status}
                      </Link>
                    </p>
                  </div>
                </div>
              </AdminListItem>
            ))}
          </AdminList>
        )}
      </AdminContentSection>
    </>
  );
}
