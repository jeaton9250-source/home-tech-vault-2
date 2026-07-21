"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Copy, ExternalLink, Loader2, Search } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel, {
  AdminEmptyState,
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
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
      <AdminPageHeader
        title="Subscriptions"
        description="Read-only billing overview from Stripe-synced Supabase records."
      />

      <AdminPanel title="Subscription directory">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="md:col-span-1">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Search
            </span>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Name, email, or user ID"
                className="w-full rounded-2xl border border-border-subtle bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
              />
            </div>
          </label>

          <FilterSelect
            label="Plan"
            value={plan}
            onChange={(value) => {
              setPage(1);
              setPlan(value);
            }}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              {
                value: "family",
                label: "Family",
              },
            ]}
          />

          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
            options={[
              {
                value: "active",
                label: "Active",
              },
              {
                value: "trialing",
                label: "Trialing",
              },
              {
                value: "past_due",
                label: "Past due",
              },
              {
                value: "canceled",
                label: "Canceled",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
          />
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center text-text-secondary">
            <Loader2
              size={20}
              className="mr-3 animate-spin"
            />
            Loading subscriptions...
          </div>
        ) : error ? (
          <p className="mt-6 text-sm text-red-700">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <div className="mt-6">
            <AdminEmptyState
              title="No subscriptions found"
              description="Try a different search or filter."
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs uppercase tracking-[0.14em] text-text-tertiary">
                  <th className="px-3 py-3">
                    User
                  </th>
                  <th className="px-3 py-3">
                    Personal
                  </th>
                  <th className="px-3 py-3">
                    Effective
                  </th>
                  <th className="px-3 py-3">
                    Status
                  </th>
                  <th className="px-3 py-3">
                    Billing
                  </th>
                  <th className="px-3 py-3">
                    Period end
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.userId}
                    className="border-b border-border-subtle/70"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium text-text-primary">
                        {row.fullName ||
                          row.email ||
                          row.userId}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {row.email}
                      </p>
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {row.personalPlan}
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {row.effectivePlan}
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {row.status}
                    </td>
                    <td className="px-3 py-4">
                      <p className="capitalize text-text-primary">
                        {row.billingSource.replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.stripeCustomerId ? (
                          <CopyChip
                            label="Customer"
                            value={
                              row.stripeCustomerId
                            }
                            href={`${STRIPE_DASHBOARD_BASE}/customers/${row.stripeCustomerId}`}
                          />
                        ) : null}
                        {row.stripeSubscriptionId ? (
                          <CopyChip
                            label="Sub"
                            value={
                              row.stripeSubscriptionId
                            }
                            href={`${STRIPE_DASHBOARD_BASE}/subscriptions/${row.stripeSubscriptionId}`}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-text-secondary">
                      {formatAdminDate(
                        row.currentPeriodEnd
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-text-secondary">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage((current) =>
                    current + 1
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </AdminPanel>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
