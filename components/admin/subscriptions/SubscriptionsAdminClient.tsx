"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Copy, ExternalLink } from "lucide-react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterSelect,
  AdminList,
  AdminLoadingState,
  AdminPageHero,
  AdminPagination,
  AdminSearchField,
  AdminSearchFilters,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminSubscriptionRow } from "@/lib/admin/types";

type SubscriptionsResponse = {
  subscriptions: AdminSubscriptionRow[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const STRIPE_DASHBOARD_BASE =
  "https://dashboard.stripe.com";

export default function SubscriptionsAdminClient() {
  const [rows, setRows] = useState<
    AdminSubscriptionRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<
      SubscriptionsResponse["pagination"] | null
    >(null);

  const loadSubscriptions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "25",
        });

        if (search.trim()) {
          params.set("q", search.trim());
        }

        if (plan) {
          params.set("plan", plan);
        }

        if (status) {
          params.set("status", status);
        }

        const response = await fetch(
          `/api/admin/subscriptions?${params.toString()}`
        );

        const payload =
          (await response.json()) as SubscriptionsResponse & {
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load subscriptions."
          );
        }

        setRows(payload.subscriptions);
        setPagination(payload.pagination);
      } catch (loadError) {
        setRows([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load subscriptions."
        );
      } finally {
        setLoading(false);
      }
    }, [page, search, plan, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubscriptions();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSubscriptions]);

  return (
    <>
      <AdminPageHero
        title="Subscriptions"
        description="Read-only billing overview from Stripe-synced Supabase records."
        primaryAction={{
          label: "Open Stripe",
          href: STRIPE_DASHBOARD_BASE,
        }}
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Visible rows"
          value={pagination?.total ?? rows.length}
        />
        <AdminSummaryCard
          label="Current page"
          value={pagination?.page ?? page}
        />
        <AdminSummaryCard
          label="Plan filter"
          value={plan || "All"}
        />
        <AdminSummaryCard
          label="Status filter"
          value={status || "All"}
        />
      </AdminSummaryGrid>

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2"
          value={search}
          onChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          placeholder="Search name, email, or user ID"
        />
        <AdminFilterSelect
          label="Plan"
          value={plan}
          onChange={(value) => {
            setPage(1);
            setPlan(value);
          }}
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
            { value: "family", label: "Family" },
          ]}
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          options={[
            { value: "active", label: "Active" },
            { value: "trialing", label: "Trialing" },
            { value: "past_due", label: "Past due" },
            { value: "canceled", label: "Canceled" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </AdminSearchFilters>

      <AdminContentSection
        id="subscriptions-directory-heading"
        title="Subscription directory"
        subtitle="Stripe-synced subscription records."
      >
        {loading ? (
          <AdminLoadingState label="Loading subscriptions…" />
        ) : error ? (
          <AdminErrorState message={error} />
        ) : rows.length === 0 ? (
          <AdminEmptyState
            title="No subscriptions found"
            description="Try a different search or filter."
          />
        ) : (
          <AdminList>
            {rows.map((row) => (
              <li
                key={row.userId}
                className="bg-surface-sunken px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-medium text-text-primary">
                      {row.fullName ||
                        row.email ||
                        row.userId}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {row.email}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2 lg:text-right">
                    <p className="capitalize text-text-primary">
                      Personal {row.personalPlan} · Effective{" "}
                      {row.effectivePlan}
                    </p>
                    <p className="capitalize text-text-secondary">
                      {row.status} ·{" "}
                      {row.billingSource.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Period end{" "}
                      {formatAdminDate(row.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.stripeCustomerId ? (
                    <CopyChip
                      label="Customer"
                      value={row.stripeCustomerId}
                      href={`${STRIPE_DASHBOARD_BASE}/customers/${row.stripeCustomerId}`}
                    />
                  ) : null}
                  {row.stripeSubscriptionId ? (
                    <CopyChip
                      label="Sub"
                      value={row.stripeSubscriptionId}
                      href={`${STRIPE_DASHBOARD_BASE}/subscriptions/${row.stripeSubscriptionId}`}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </AdminList>
        )}

        {pagination ? (
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalLabel={`${pagination.total} subscriptions`}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            onPrevious={() =>
              setPage((current) => Math.max(1, current - 1))
            }
            onNext={() => setPage((current) => current + 1)}
          />
        ) : null}
      </AdminContentSection>
    </>
  );
}

function CopyChip({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-sunken px-2 py-1 text-xs">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(
            value
          );
        }}
        className="text-text-secondary"
        aria-label={`Copy ${label}`}
      >
        <Copy size={12} />
      </button>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-interaction"
        aria-label={`Open ${label} in Stripe`}
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
