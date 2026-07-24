"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import SubscriptionsDirectoryTable from "@/components/admin/subscriptions/SubscriptionsDirectoryTable";
import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterSelect,
  AdminLoadingState,
  AdminPageHero,
  AdminPagination,
  AdminSearchField,
  AdminSearchFilters,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
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

  const loadSubscriptions = useCallback(async () => {
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

  const activeCount = rows.filter(
    (row) =>
      row.status === "active" ||
      row.status === "trialing"
  ).length;

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
          label="Total rows"
          value={pagination?.total ?? rows.length}
        />
        <AdminSummaryCard
          label="Active on page"
          value={activeCount}
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
        subtitle="Stripe-ready billing table with customer links."
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
          <SubscriptionsDirectoryTable
            rows={rows}
            buildActions={(row) => {
              const actions = [
                {
                  id: "user",
                  label: "View User",
                  onClick: () => {
                    window.location.href = `/admin/users?selected=${row.userId}`;
                  },
                },
              ];

              if (row.stripeCustomerId) {
                actions.push({
                  id: "stripe-customer",
                  label: "Open Stripe Customer",
                  onClick: () => {
                    window.open(
                      `${STRIPE_DASHBOARD_BASE}/customers/${row.stripeCustomerId}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  },
                });
              }

              if (row.stripeSubscriptionId) {
                actions.push({
                  id: "stripe-sub",
                  label: "Open Stripe Subscription",
                  onClick: () => {
                    window.open(
                      `${STRIPE_DASHBOARD_BASE}/subscriptions/${row.stripeSubscriptionId}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  },
                });
              }

              return actions;
            }}
          />
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
