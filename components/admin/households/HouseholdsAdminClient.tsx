"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { Home } from "lucide-react";

import HouseholdDetailSlideOver from "@/components/admin/households/HouseholdDetailSlideOver";
import HouseholdsDirectoryTable from "@/components/admin/households/HouseholdsDirectoryTable";
import AdminExportMenu from "@/components/admin/ui/AdminExportMenu";
import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHero,
  AdminPagination,
  AdminSearchField,
  AdminSearchFilters,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
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
  const searchParams = useSearchParams();
  const [households, setHouseholds] = useState<
    AdminHouseholdSummary[]
  >([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [detail, setDetail] =
    useState<AdminHouseholdDetail | null>(null);
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

  const loadHouseholds = useCallback(async () => {
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

  const loadDetail = useCallback(
    async (householdId: string) => {
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
    },
    []
  );

  useEffect(() => {
    const selectedFromUrl =
      searchParams.get("selected");

    if (!selectedFromUrl) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadDetail(selectedFromUrl);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchParams, loadDetail]);

  return (
    <>
      <AdminPageHero
        title="Households"
        description="Review household ownership, membership, connectors, and shared vault activity."
        action={
          <AdminExportMenu kinds={["households"]} />
        }
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

      <AdminContentSection
        id="households-directory-heading"
        title="Household directory"
        subtitle="Professional table with slide-over details."
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
          <HouseholdsDirectoryTable
            households={households}
            selectedHouseholdId={selectedId}
            onSelect={(householdId) => {
              void loadDetail(householdId);
            }}
            buildActions={(household) => [
              {
                id: "view",
                label: "View Details",
                onClick: () => {
                  void loadDetail(household.id);
                },
              },
              {
                id: "owner",
                label: "View Owner",
                onClick: () => {
                  window.location.href = `/admin/users?selected=${household.ownerId}`;
                },
              },
            ]}
          />
        )}

        {pagination ? (
          <div className="mt-6">
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
          </div>
        ) : null}
      </AdminContentSection>

      <HouseholdDetailSlideOver
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
        }}
        loading={detailLoading}
        detail={detail}
      />
    </>
  );
}
