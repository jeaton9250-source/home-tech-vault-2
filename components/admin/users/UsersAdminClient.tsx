"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { Users } from "lucide-react";

import PlanAccessAdminSection from "@/components/admin/users/PlanAccessAdminSection";
import FoundingMemberAdminSection from "@/components/admin/users/FoundingMemberAdminSection";
import AccountDangerZone from "@/components/admin/users/AccountDangerZone";
import {
  AdminContentSection,
  AdminDetailField,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterSelect,
  AdminList,
  AdminListItem,
  AdminLoadingState,
  AdminPageHero,
  AdminPagination,
  AdminSearchField,
  AdminSearchFilters,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type {
  AdminUserDetail,
  AdminUserSummary,
} from "@/lib/admin/types";

type UsersResponse = {
  users: AdminUserSummary[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type UsersAdminClientProps = {
  summary: {
    totalUsers: number;
    newUsersToday: number;
    activeSubscriptions: number;
    paidMembers: number;
  };
};

export default function UsersAdminClient({
  summary,
}: UsersAdminClientProps) {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<
    AdminUserSummary[]
  >([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] =
    useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [adminFilter, setAdminFilter] =
    useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<UsersResponse["pagination"] | null>(
      null
    );
  const [detail, setDetail] =
    useState<AdminUserDetail | null>(null);
  const [adminMessage, setAdminMessage] =
    useState("");

  const loadUsers = useCallback(async () => {
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

      if (adminFilter) {
        params.set("admin", adminFilter);
      }

      const response = await fetch(
        `/api/admin/users?${params.toString()}`
      );

      const payload =
        (await response.json()) as UsersResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load users."
        );
      }

      setUsers(payload.users);
      setPagination(payload.pagination);
    } catch (loadError) {
      setUsers([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, plan, adminFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadUsers]);

  async function loadDetail(userId: string) {
    try {
      setDetailLoading(true);
      setSelectedId(userId);
      setAdminMessage("");
      setDetailError("");

      const response = await fetch(
        `/api/admin/users/${userId}`
      );

      const payload =
        (await response.json()) as {
          user?: AdminUserDetail;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load user details."
        );
      }

      if (!payload.user) {
        throw new Error(
          "Unable to load user details."
        );
      }

      setDetail(payload.user);
    } catch (loadDetailError) {
      setDetail(null);
      setDetailError(
        loadDetailError instanceof Error
          ? loadDetailError.message
          : "Unable to load user details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

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
  }, [searchParams]);

  async function togglePlatformAdmin(
    nextValue: boolean
  ) {
    if (!selectedId) {
      return;
    }

    const confirmed = window.confirm(
      nextValue
        ? "Grant platform-admin access to this user?"
        : "Remove platform-admin access from this user?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/admin/users/${selectedId}/platform-admin`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAdmin: nextValue,
          confirm: true,
        }),
      }
    );

    const payload =
      (await response.json()) as {
        user?: AdminUserDetail;
        error?: string;
      };

    if (!response.ok) {
      setAdminMessage(
        payload.error ||
          "Unable to update platform-admin status."
      );
      return;
    }

    setDetail(payload.user ?? null);
    setAdminMessage(
      nextValue
        ? "Platform-admin access granted."
        : "Platform-admin access removed."
    );
    void loadUsers();
  }

  return (
    <>
      <AdminPageHero
        title="Users"
        description="Search accounts, review plan context, and manage platform-admin access."
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Total users"
          value={summary.totalUsers}
          icon={
            <Users
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
        <AdminSummaryCard
          label="New today"
          value={summary.newUsersToday}
        />
        <AdminSummaryCard
          label="Active subscriptions"
          value={summary.activeSubscriptions}
        />
        <AdminSummaryCard
          label="Paid members"
          value={summary.paidMembers}
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
          label="Platform admin"
          value={adminFilter}
          onChange={(value) => {
            setPage(1);
            setAdminFilter(value);
          }}
          options={[
            { value: "true", label: "Admins only" },
            { value: "false", label: "Non-admins" },
          ]}
        />
      </AdminSearchFilters>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminContentSection
          id="users-directory-heading"
          title="User directory"
          subtitle="Select an account to inspect details."
        >
          {loading ? (
            <AdminLoadingState label="Loading users…" />
          ) : error ? (
            <AdminErrorState message={error} />
          ) : users.length === 0 ? (
            <AdminEmptyState
              title="No users found"
              description="Try a different search or filter."
            />
          ) : (
            <AdminList>
              {users.map((user) => (
                <AdminListItem
                  key={user.id}
                  selected={selectedId === user.id}
                  onClick={() => {
                    void loadDetail(user.id);
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {user.fullName ||
                          user.email ||
                          user.id}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.isPlatformAdmin ? (
                          <AdminStatusBadge tone="warning">
                            Platform admin
                          </AdminStatusBadge>
                        ) : null}
                        {user.accountStatus ===
                        "deactivated" ? (
                          <AdminStatusBadge tone="danger">
                            Deactivated
                          </AdminStatusBadge>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm capitalize text-text-primary">
                        {user.personalPlan}
                      </p>
                      <p className="mt-1 text-xs capitalize text-text-secondary">
                        {user.householdRole || "No role"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {formatAdminDate(user.createdAt)}
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
              totalLabel={`${pagination.total} users`}
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
          id="users-detail-heading"
          title="User detail"
          subtitle="Account context and administrative controls."
        >
          {!selectedId ? (
            <AdminEmptyState
              title="Select a user"
              description="Choose a row to inspect account details."
            />
          ) : detailLoading ? (
            <AdminLoadingState label="Loading details…" />
          ) : detailError ? (
            <AdminEmptyState
              title="User unavailable"
              description={detailError}
            />
          ) : detail ? (
            <div className="space-y-4">
              <AdminDetailField
                label="Name"
                value={detail.fullName || "—"}
              />
              <AdminDetailField
                label="Email"
                value={detail.email || "—"}
                copyValue={detail.email || ""}
                onCopy={() => {
                  void navigator.clipboard.writeText(
                    detail.email || ""
                  );
                }}
              />
              <AdminDetailField
                label="User ID"
                value={detail.id}
                copyValue={detail.id}
                onCopy={() => {
                  void navigator.clipboard.writeText(
                    detail.id
                  );
                }}
              />
              <AdminDetailField
                label="Created"
                value={formatAdminDate(detail.createdAt)}
              />
              <AdminDetailField
                label="Last sign-in"
                value={formatAdminDate(detail.lastSignInAt)}
              />
              <AdminDetailField
                label="Household"
                value={
                  detail.householdName ||
                  detail.householdId ||
                  "—"
                }
              />
              <AdminDetailField
                label="Household role"
                value={detail.householdRole || "—"}
              />
              <AdminDetailField
                label="Devices"
                value={String(detail.deviceCount)}
              />
              <AdminDetailField
                label="Documents"
                value={String(detail.documentCount)}
              />
              <AdminDetailField
                label="Support tickets"
                value={String(detail.supportTicketCount)}
              />

              {detail.householdId ? (
                <Link
                  href={`/admin/households?selected=${detail.householdId}`}
                  className="inline-flex text-sm font-semibold text-interaction"
                >
                  View household
                </Link>
              ) : null}

              <PlanAccessAdminSection
                detail={detail}
                onUpdated={async () => {
                  if (selectedId) {
                    await loadDetail(selectedId);
                  }
                }}
              />

              <FoundingMemberAdminSection
                detail={detail}
                onUpdated={async () => {
                  if (selectedId) {
                    await loadDetail(selectedId);
                  }
                }}
              />

              <AccountDangerZone
                detail={detail}
                onUpdated={async () => {
                  if (selectedId) {
                    await loadDetail(selectedId);
                  }

                  void loadUsers();
                }}
              />

              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Platform admin access
                </p>

                {adminMessage && (
                  <p className="mt-2 text-sm text-text-secondary">
                    {adminMessage}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.isPlatformAdmin ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        void togglePlatformAdmin(
                          false
                        );
                      }}
                    >
                      Remove platform admin
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        void togglePlatformAdmin(
                          true
                        );
                      }}
                    >
                      Grant platform admin
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="User unavailable"
              description="This account could not be loaded."
            />
          )}
        </AdminContentSection>
      </section>
    </>
  );
}
