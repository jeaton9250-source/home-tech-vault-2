"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Copy, Loader2, Search } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel, {
  AdminEmptyState,
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type {
  AdminHouseholdDetail,
  AdminHouseholdSummary,
} from "@/lib/admin/types";

type HouseholdsResponse = {
  households: AdminHouseholdSummary[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export default function HouseholdsAdminClient() {
  const [households, setHouseholds] = useState<
    AdminHouseholdSummary[]
  >([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [detail, setDetail] =
    useState<AdminHouseholdDetail | null>(
      null
    );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<
      HouseholdsResponse["pagination"] | null
    >(null);

  const loadHouseholds =
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

        const response = await fetch(
          `/api/admin/households?${params.toString()}`
        );

        const payload =
          (await response.json()) as HouseholdsResponse & {
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load households."
          );
        }

        setHouseholds(payload.households);
        setPagination(payload.pagination);
      } catch (loadError) {
        setHouseholds([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load households."
        );
      } finally {
        setLoading(false);
      }
    }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHouseholds();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadHouseholds]);

  async function loadDetail(
    householdId: string
  ) {
    try {
      setDetailLoading(true);
      setSelectedId(householdId);

      const response = await fetch(
        `/api/admin/households/${householdId}`
      );

      const payload =
        (await response.json()) as {
          household?: AdminHouseholdDetail;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load household details."
        );
      }

      setDetail(payload.household ?? null);
    } catch (detailError) {
      setDetail(null);
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load household details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Households"
        description="Operational visibility into household ownership, membership, and shared vault activity."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel title="Household directory">
          <label className="block">
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
                placeholder="Household name or ID"
                className="w-full rounded-2xl border border-border-subtle bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
              />
            </div>
          </label>

          {loading ? (
            <div className="mt-8 flex items-center justify-center text-text-secondary">
              <Loader2
                size={20}
                className="mr-3 animate-spin"
              />
              Loading households...
            </div>
          ) : error ? (
            <p className="mt-6 text-sm text-red-700">
              {error}
            </p>
          ) : households.length === 0 ? (
            <div className="mt-6">
              <AdminEmptyState
                title="No households found"
                description="Try a different search."
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-xs uppercase tracking-[0.14em] text-text-tertiary">
                    <th className="px-3 py-3">
                      Household
                    </th>
                    <th className="px-3 py-3">
                      Owner
                    </th>
                    <th className="px-3 py-3">
                      Members
                    </th>
                    <th className="px-3 py-3">
                      Plan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((household) => (
                    <tr
                      key={household.id}
                      className="cursor-pointer border-b border-border-subtle/70 hover:bg-surface-sunken/60"
                      onClick={() => {
                        void loadDetail(
                          household.id
                        );
                      }}
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium text-text-primary">
                          {household.name}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {formatAdminDate(
                            household.createdAt
                          )}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-text-primary">
                          {household.ownerName ||
                            household.ownerEmail ||
                            household.ownerId}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        {household.memberCount}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {
                          household.inheritedPlan
                        }
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

        <AdminPanel title="Household detail">
          {!selectedId ? (
            <AdminEmptyState
              title="Select a household"
              description="Choose a row to inspect members and counts."
            />
          ) : detailLoading ? (
            <div className="flex items-center text-text-secondary">
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />
              Loading details...
            </div>
          ) : detail ? (
            <div className="space-y-4 text-sm">
              <CopyRow
                label="Household ID"
                value={detail.id}
              />
              <p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Name
                </span>
                <span className="mt-1 block text-text-primary">
                  {detail.name}
                </span>
              </p>
              <p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Owner
                </span>
                <span className="mt-1 block text-text-primary">
                  {detail.ownerName ||
                    detail.ownerEmail ||
                    detail.ownerId}
                </span>
                <Link
                  href={`/admin/users?selected=${detail.ownerId}`}
                  className="mt-1 inline-flex text-sm font-semibold text-interaction"
                >
                  View owner profile
                </Link>
              </p>
              <p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Inherited plan
                </span>
                <span className="mt-1 block capitalize text-text-primary">
                  {detail.inheritedPlan}
                </span>
              </p>
              <p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Devices / documents
                </span>
                <span className="mt-1 block text-text-primary">
                  {detail.deviceCount} devices ·{" "}
                  {detail.documentCount}{" "}
                  documents
                </span>
              </p>
              <p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Open support tickets
                </span>
                <span className="mt-1 block text-text-primary">
                  {detail.openSupportTickets}
                </span>
              </p>

              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Members
                </p>
                <div className="mt-3 space-y-3">
                  {detail.members.map(
                    (member) => (
                      <div
                        key={member.userId}
                        className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                      >
                        <p className="font-medium text-text-primary">
                          {member.fullName ||
                            member.email ||
                            member.userId}
                        </p>
                        <p className="mt-1 capitalize text-text-secondary">
                          {member.role}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="Household unavailable"
              description="This household could not be loaded."
            />
          )}
        </AdminPanel>
      </section>
    </>
  );
}

function CopyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </p>
        <p className="mt-1 break-all text-text-primary">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(
            value
          );
        }}
        className="rounded-xl border border-border-subtle p-2 text-text-secondary transition hover:bg-surface-sunken"
        aria-label={`Copy ${label}`}
      >
        <Copy size={15} />
      </button>
    </div>
  );
}
