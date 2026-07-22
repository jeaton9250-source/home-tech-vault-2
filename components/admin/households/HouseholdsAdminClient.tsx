"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Home } from "lucide-react";

import {
  AdminContentSection,
  AdminDetailField,
  AdminEmptyState,
  AdminErrorState,
  AdminList,
  AdminListItem,
  AdminLoadingState,
  AdminPageHero,
  AdminPagination,
  AdminSearchField,
  AdminSearchFilters,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
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

type HouseholdsAdminClientProps = {
  summary: {
    totalHouseholds: number;
    totalDevices: number;
    totalDocuments: number;
    openSupportTickets: number;
  };
};

export default function HouseholdsAdminClient({
  summary,
}: HouseholdsAdminClientProps) {
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
      <AdminPageHero
        title="Households"
        description="Review household ownership, membership, and shared vault activity."
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Households"
          value={summary.totalHouseholds}
          icon={
            <Home
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
        <AdminSummaryCard
          label="Devices"
          value={summary.totalDevices}
        />
        <AdminSummaryCard
          label="Documents"
          value={summary.totalDocuments}
        />
        <AdminSummaryCard
          label="Open support"
          value={summary.openSupportTickets}
        />
      </AdminSummaryGrid>

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2 xl:col-span-4"
          value={search}
          onChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          placeholder="Search household name or ID"
        />
      </AdminSearchFilters>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminContentSection
          id="households-directory-heading"
          title="Household directory"
          subtitle="Select a household to inspect members and counts."
        >
          {loading ? (
            <AdminLoadingState label="Loading households…" />
          ) : error ? (
            <AdminErrorState message={error} />
          ) : households.length === 0 ? (
            <AdminEmptyState
              title="No households found"
              description="Try a different search."
            />
          ) : (
            <AdminList>
              {households.map((household) => (
                <AdminListItem
                  key={household.id}
                  selected={selectedId === household.id}
                  onClick={() => {
                    void loadDetail(household.id);
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {household.name}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {household.ownerName ||
                          household.ownerEmail ||
                          household.ownerId}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatAdminDate(
                          household.createdAt
                        )}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-text-primary">
                        {household.memberCount} members
                      </p>
                      <p className="mt-1 text-sm capitalize text-text-secondary">
                        {household.inheritedPlan}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {household.deviceCount} devices
                      </p>
                    </div>
                  </div>
                </AdminListItem>
              ))}
            </AdminList>
          )}

          {pagination ? (
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalLabel={`${pagination.total} households`}
              hasPreviousPage={
                pagination.hasPreviousPage
              }
              hasNextPage={pagination.hasNextPage}
              onPrevious={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              onNext={() =>
                setPage((current) => current + 1)
              }
            />
          ) : null}
        </AdminContentSection>

        <AdminContentSection
          id="households-detail-heading"
          title="Household detail"
          subtitle="Membership and inventory context."
        >
          {!selectedId ? (
            <AdminEmptyState
              title="Select a household"
              description="Choose a household to inspect members and counts."
            />
          ) : detailLoading ? (
            <AdminLoadingState label="Loading details…" />
          ) : detail ? (
            <div className="space-y-4">
              <AdminDetailField
                label="Household ID"
                value={detail.id}
                copyValue={detail.id}
                onCopy={() => {
                  void navigator.clipboard.writeText(
                    detail.id
                  );
                }}
              />
              <AdminDetailField
                label="Name"
                value={detail.name}
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
                  Owner
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {detail.ownerName ||
                    detail.ownerEmail ||
                    detail.ownerId}
                </p>
                <Link
                  href={`/admin/users?selected=${detail.ownerId}`}
                  className="mt-2 inline-flex text-sm font-medium text-interaction"
                >
                  View owner profile
                </Link>
              </div>
              <AdminDetailField
                label="Inherited plan"
                value={detail.inheritedPlan}
              />
              <AdminDetailField
                label="Devices / documents"
                value={`${detail.deviceCount} devices · ${detail.documentCount} documents`}
              />
              <AdminDetailField
                label="Open support tickets"
                value={String(detail.openSupportTickets)}
              />
              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
                  Members
                </p>
                <div className="mt-3 space-y-3">
                  {detail.members.map((member) => (
                    <div
                      key={member.userId}
                      className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                    >
                      <p className="font-medium text-text-primary">
                        {member.fullName ||
                          member.email ||
                          member.userId}
                      </p>
                      <p className="mt-1 capitalize text-sm text-text-secondary">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="Household unavailable"
              description="This household could not be loaded."
            />
          )}
        </AdminContentSection>
      </section>
    </>
  );
}
