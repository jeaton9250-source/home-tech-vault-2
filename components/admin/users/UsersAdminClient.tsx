"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Copy,
  Loader2,
  Search,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel, {
  AdminEmptyState,
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type { AdminUserSummary } from "@/lib/admin/types";

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

export default function UsersAdminClient() {
  const [users, setUsers] = useState<
    AdminUserSummary[]
  >([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [error, setError] = useState("");
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
    useState<Record<string, unknown> | null>(
      null
    );
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

      const response = await fetch(
        `/api/admin/users/${userId}`
      );

      const payload =
        (await response.json()) as {
          user?: Record<string, unknown>;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load user details."
        );
      }

      setDetail(payload.user ?? null);
    } catch (detailError) {
      setDetail(null);
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load user details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

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
        user?: Record<string, unknown>;
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
      <AdminPageHeader
        title="Users"
        description="Search accounts, review plan context, and manage platform-admin access."
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel title="User directory">
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
              label="Platform admin"
              value={adminFilter}
              onChange={(value) => {
                setPage(1);
                setAdminFilter(value);
              }}
              options={[
                {
                  value: "true",
                  label: "Admins only",
                },
                {
                  value: "false",
                  label: "Non-admins",
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
              Loading users...
            </div>
          ) : error ? (
            <p className="mt-6 text-sm text-red-700">
              {error}
            </p>
          ) : users.length === 0 ? (
            <div className="mt-6">
              <AdminEmptyState
                title="No users found"
                description="Try a different search or filter."
              />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-xs uppercase tracking-[0.14em] text-text-tertiary">
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Plan</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="cursor-pointer border-b border-border-subtle/70 hover:bg-surface-sunken/60"
                      onClick={() => {
                        void loadDetail(user.id);
                      }}
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium text-text-primary">
                          {user.fullName ||
                            user.email ||
                            user.id}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {user.email}
                        </p>
                        {user.isPlatformAdmin && (
                          <span className="mt-2 inline-flex rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-achievement">
                            Platform admin
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {user.personalPlan}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {user.householdRole ||
                          "—"}
                      </td>
                      <td className="px-3 py-4 text-text-secondary">
                        {formatAdminDate(
                          user.createdAt
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
                {pagination.totalPages} ·{" "}
                {pagination.total} users
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

        <AdminPanel title="User detail">
          {!selectedId ? (
            <AdminEmptyState
              title="Select a user"
              description="Choose a row to inspect account details."
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
              <DetailRow
                label="Name"
                value={String(
                  detail.fullName || "—"
                )}
              />
              <DetailRow
                label="Email"
                value={String(
                  detail.email || "—"
                )}
                copyValue={String(
                  detail.email || ""
                )}
              />
              <DetailRow
                label="User ID"
                value={String(detail.id)}
                copyValue={String(detail.id)}
              />
              <DetailRow
                label="Created"
                value={formatAdminDate(
                  detail.createdAt as string
                )}
              />
              <DetailRow
                label="Last sign-in"
                value={formatAdminDate(
                  detail.lastSignInAt as string
                )}
              />
              <DetailRow
                label="Personal plan"
                value={String(
                  detail.personalPlan
                )}
              />
              <DetailRow
                label="Effective plan"
                value={String(
                  detail.effectivePlan
                )}
              />
              <DetailRow
                label="Subscription status"
                value={String(
                  detail.subscriptionStatus
                )}
              />
              <DetailRow
                label="Household"
                value={String(
                  detail.householdName ||
                    detail.householdId ||
                    "—"
                )}
              />
              <DetailRow
                label="Household role"
                value={String(
                  detail.householdRole || "—"
                )}
              />
              <DetailRow
                label="Devices"
                value={String(detail.deviceCount)}
              />
              <DetailRow
                label="Documents"
                value={String(
                  detail.documentCount
                )}
              />
              <DetailRow
                label="Support tickets"
                value={String(
                  detail.supportTicketCount
                )}
              />

              {detail.householdId ? (
                <Link
                  href={`/admin/households?selected=${detail.householdId}`}
                  className="inline-flex text-sm font-semibold text-interaction"
                >
                  View household
                </Link>
              ) : null}

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
        </AdminPanel>
      </section>
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

function DetailRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </p>
        <p className="mt-1 text-text-primary">
          {value}
        </p>
      </div>

      {copyValue ? (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(
              copyValue
            );
          }}
          className="rounded-xl border border-border-subtle p-2 text-text-secondary transition hover:bg-surface-sunken"
          aria-label={`Copy ${label}`}
        >
          <Copy size={15} />
        </button>
      ) : null}
    </div>
  );
}
