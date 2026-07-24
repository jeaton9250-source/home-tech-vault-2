"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { Plus, RefreshCw, Users } from "lucide-react";

import InviteUserModal from "@/components/admin/users/InviteUserModal";
import UserDetailSlideOver from "@/components/admin/users/UserDetailSlideOver";
import UsersDirectoryTable, {
  type UserSortKey,
} from "@/components/admin/users/UsersDirectoryTable";
import InvitationsDirectoryTable from "@/components/admin/users/InvitationsDirectoryTable";
import AdminExportMenu from "@/components/admin/ui/AdminExportMenu";
import AdminFilterPills from "@/components/admin/ui/AdminFilterPills";
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
import Button from "@/components/ui/Button";
import type { AdminUserMetrics } from "@/lib/admin/data/userMetrics";
import type {
  AdminPendingInvitation,
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

type DirectorySelection =
  | { kind: "user"; id: string }
  | { kind: "invitation"; id: string }
  | null;

const USER_FILTER_OPTIONS = [
  { id: "all", label: "All Users" },
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
  { id: "admins", label: "Admins" },
  { id: "pro", label: "Pro" },
  { id: "free", label: "Free" },
  { id: "never_logged_in", label: "Never Logged In" },
  { id: "has_connector", label: "Has Connector" },
  { id: "no_connector", label: "No Connector" },
];

type UsersAdminClientProps = {
  metrics: AdminUserMetrics;
};

export default function UsersAdminClient({
  metrics,
}: UsersAdminClientProps) {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [invitations, setInvitations] = useState<
    AdminPendingInvitation[]
  >([]);
  const [selection, setSelection] =
    useState<DirectorySelection>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    UsersResponse["pagination"] | null
  >(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(
    null
  );
  const [selectedInvitation, setSelectedInvitation] =
    useState<AdminPendingInvitation | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] =
    useState(false);
  const [repairLoading, setRepairLoading] = useState(false);
  const [sortKey, setSortKey] =
    useState<UserSortKey>("joined");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("desc");

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

      const invitationParams = new URLSearchParams();

      if (search.trim()) {
        invitationParams.set("q", search.trim());
      }

      const [usersResponse, invitationsResponse] =
        await Promise.all([
          fetch(`/api/admin/users?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/admin/users/invitations?${invitationParams.toString()}`,
            { cache: "no-store" }
          ),
        ]);

      const usersPayload =
        (await usersResponse.json()) as UsersResponse & {
          error?: string;
        };

      const invitationsPayload =
        (await invitationsResponse.json()) as {
          invitations?: AdminPendingInvitation[];
          error?: string;
        };

      if (!usersResponse.ok) {
        throw new Error(
          usersPayload.error || "Unable to load users."
        );
      }

      if (!invitationsResponse.ok) {
        throw new Error(
          invitationsPayload.error ||
            "Unable to load invitations."
        );
      }

      setUsers(usersPayload.users);
      setInvitations(invitationsPayload.invitations ?? []);
      setPagination(usersPayload.pagination);
    } catch (loadError) {
      setUsers([]);
      setInvitations([]);
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
      setSelection({ kind: "user", id: userId });
      setSelectedInvitation(null);
      setAdminMessage("");
      setDetailError("");

      const response = await fetch(
        `/api/admin/users/${userId}`
      );

      const payload = (await response.json()) as {
        user?: AdminUserDetail;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to load user details."
        );
      }

      if (!payload.user) {
        throw new Error("Unable to load user details.");
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

  function selectInvitation(
    invitation: AdminPendingInvitation
  ) {
    setSelection({
      kind: "invitation",
      id: invitation.id,
    });
    setSelectedInvitation(invitation);
    setDetail(null);
    setDetailError("");
    setAdminMessage("");
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

  useEffect(() => {
    if (userFilter === "invited") {
      setPlan("");
      setAdminFilter("");
    } else if (userFilter === "pro") {
      setPlan("pro");
    } else if (userFilter === "free") {
      setPlan("free");
    } else if (userFilter === "admins") {
      setAdminFilter("true");
      setPlan("");
    } else if (userFilter === "all") {
      setPlan("");
      setAdminFilter("");
    }
  }, [userFilter]);

  const filteredUsers = useMemo(() => {
    let rows = [...users];

    if (userFilter === "suspended") {
      rows = rows.filter(
        (user) => user.accountStatus === "deactivated"
      );
    }

    if (userFilter === "active") {
      rows = rows.filter(
        (user) =>
          user.accountStatus === "active" &&
          Boolean(user.lastSignInAt)
      );
    }

    if (userFilter === "never_logged_in") {
      rows = rows.filter(
        (user) => !user.lastSignInAt
      );
    }

    if (userFilter === "has_connector") {
      rows = rows.filter((user) => user.hasConnector);
    }

    if (userFilter === "no_connector") {
      rows = rows.filter((user) => !user.hasConnector);
    }

    rows.sort((left, right) => {
      const direction =
        sortDirection === "asc" ? 1 : -1;

      switch (sortKey) {
        case "name":
          return (
            (left.fullName || left.email || "")
              .localeCompare(
                right.fullName || right.email || ""
              ) * direction
          );
        case "plan":
          return (
            left.personalPlan.localeCompare(
              right.personalPlan
            ) * direction
          );
        case "devices":
          return (
            (left.deviceCount - right.deviceCount) *
            direction
          );
        case "lastActive": {
          const leftTime = left.lastSignInAt
            ? new Date(left.lastSignInAt).getTime()
            : 0;
          const rightTime = right.lastSignInAt
            ? new Date(right.lastSignInAt).getTime()
            : 0;
          return (leftTime - rightTime) * direction;
        }
        case "joined":
        default: {
          const leftTime = left.createdAt
            ? new Date(left.createdAt).getTime()
            : 0;
          const rightTime = right.createdAt
            ? new Date(right.createdAt).getTime()
            : 0;
          return (leftTime - rightTime) * direction;
        }
      }
    });

    return rows;
  }, [
    users,
    userFilter,
    sortKey,
    sortDirection,
  ]);

  const filteredInvitations = useMemo(() => {
    if (
      userFilter !== "all" &&
      userFilter !== "invited"
    ) {
      return [];
    }

    return invitations;
  }, [invitations, userFilter]);

  function handleSort(key: UserSortKey) {
    setSortKey((current) => {
      if (current === key) {
        setSortDirection((direction) =>
          direction === "asc" ? "desc" : "asc"
        );
        return current;
      }

      setSortDirection("desc");
      return key;
    });
  }

  async function togglePlatformAdmin(
    nextValue: boolean
  ) {
    if (!selection || selection.kind !== "user") {
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
      `/api/admin/users/${selection.id}/platform-admin`,
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

    const payload = (await response.json()) as {
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

  async function resendInvitation(
    invitationId: string
  ) {
    try {
      setInviteActionLoading(true);
      setAdminMessage("");

      const response = await fetch(
        `/api/admin/users/invitations/${invitationId}`,
        { method: "POST" }
      );

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to resend the invitation."
        );
      }

      setAdminMessage(
        payload.message || "Invitation resent."
      );
    } catch (actionError) {
      setAdminMessage(
        actionError instanceof Error
          ? actionError.message
          : "Unable to resend the invitation."
      );
    } finally {
      setInviteActionLoading(false);
    }
  }

  async function revokeInvitation(
    invitationId: string
  ) {
    const confirmed = window.confirm(
      "Revoke this pending invitation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setInviteActionLoading(true);
      setAdminMessage("");

      const response = await fetch(
        `/api/admin/users/invitations/${invitationId}`,
        { method: "DELETE" }
      );

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to revoke the invitation."
        );
      }

      setSelection(null);
      setSelectedInvitation(null);
      setAdminMessage(
        payload.message || "Invitation revoked."
      );
      void loadUsers();
    } catch (actionError) {
      setAdminMessage(
        actionError instanceof Error
          ? actionError.message
          : "Unable to revoke the invitation."
      );
    } finally {
      setInviteActionLoading(false);
    }
  }

  async function repairMissingProfiles() {
    try {
      setRepairLoading(true);
      setAdminMessage("");

      const response = await fetch(
        "/api/admin/users/repair-profiles",
        { method: "POST" }
      );

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to repair missing profiles."
        );
      }

      setAdminMessage(
        payload.message ||
          "Missing profile repair completed."
      );
      void loadUsers();
    } catch (actionError) {
      setAdminMessage(
        actionError instanceof Error
          ? actionError.message
          : "Unable to repair missing profiles."
      );
    } finally {
      setRepairLoading(false);
    }
  }

  const slideOverOpen = Boolean(selection);

  return (
    <>
      <AdminPageHero
        title="Users"
        description="Manage accounts, invitations, platform access, and household onboarding from one directory."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminExportMenu
              kinds={[
                "users",
                "invitations",
                "activity",
              ]}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void loadUsers();
              }}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void repairMissingProfiles();
              }}
              disabled={repairLoading}
            >
              {repairLoading
                ? "Repairing…"
                : "Repair Profiles"}
            </Button>
            <Button
              type="button"
              onClick={() => setInviteOpen(true)}
            >
              <Plus size={17} />
              Invite User
            </Button>
          </div>
        }
      />

      {adminMessage && !selection ? (
        <p className="rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary shadow-[var(--shadow-sm)]">
          {adminMessage}
        </p>
      ) : null}

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Total Users"
          value={metrics.totalUsers}
          icon={
            <Users
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
        <AdminSummaryCard
          label="Active Today"
          value={metrics.activeToday}
        />
        <AdminSummaryCard
          label="Pending Invitations"
          value={metrics.pendingInvitations}
        />
        <AdminSummaryCard
          label="Pro Subscribers"
          value={metrics.proSubscribers}
        />
        <AdminSummaryCard
          label="Free Users"
          value={metrics.freeUsers}
        />
        <AdminSummaryCard
          label="Suspended Users"
          value={metrics.suspendedUsers}
        />
        <AdminSummaryCard
          label="New This Week"
          value={metrics.newThisWeek}
        />
        <AdminSummaryCard
          label="Growth %"
          value={`${metrics.growthPercent}%`}
          hint={`${metrics.newThisMonth} new this month`}
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
          placeholder="Search name, email, household, or user ID"
        />
      </AdminSearchFilters>

      <AdminFilterPills
        options={USER_FILTER_OPTIONS}
        value={userFilter}
        onChange={(value) => {
          setPage(1);
          setUserFilter(value);
        }}
      />

      <AdminContentSection
        id="users-directory-heading"
        title="User directory"
        subtitle="Professional account table with sortable columns and quick actions."
      >
        {loading ? (
          <AdminLoadingState label="Loading users…" />
        ) : error ? (
          <AdminErrorState message={error} />
        ) : filteredUsers.length === 0 &&
          filteredInvitations.length === 0 ? (
          <AdminEmptyState
            title="No users found"
            description="Try a different search or filter."
          />
        ) : userFilter === "invited" ? null : (
          <UsersDirectoryTable
            users={filteredUsers}
            selectedUserId={
              selection?.kind === "user"
                ? selection.id
                : null
            }
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSelect={(userId) => {
              void loadDetail(userId);
            }}
            buildActions={(user) => [
              {
                id: "view",
                label: "View Details",
                onClick: () => {
                  void loadDetail(user.id);
                },
              },
              {
                id: "household",
                label: "View Household",
                onClick: () => {
                  if (user.householdId) {
                    window.location.href = `/admin/households?selected=${user.householdId}`;
                  }
                },
                disabled: !user.householdId,
              },
            ]}
          />
        )}

        {pagination &&
        userFilter !== "invited" ? (
          <div className="mt-6">
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
          </div>
        ) : null}
      </AdminContentSection>

      <AdminContentSection
        id="invitations-directory-heading"
        title="Pending invitations"
        subtitle="Resend, revoke, or inspect outstanding account and household invitations."
      >
        {loading ? (
          <AdminLoadingState label="Loading invitations…" />
        ) : filteredInvitations.length === 0 ? (
          <AdminEmptyState
            title="No pending invitations"
            description="New invitations will appear here after you invite users from Control Center."
          />
        ) : (
          <InvitationsDirectoryTable
            invitations={filteredInvitations}
            selectedInvitationId={
              selection?.kind === "invitation"
                ? selection.id
                : null
            }
            onSelect={selectInvitation}
            buildActions={(invitation) => [
              {
                id: "view",
                label: "View Details",
                onClick: () => {
                  selectInvitation(invitation);
                },
              },
              {
                id: "resend",
                label: "Resend",
                onClick: () => {
                  void resendInvitation(
                    invitation.id
                  );
                },
              },
              {
                id: "revoke",
                label: "Revoke",
                tone: "danger",
                onClick: () => {
                  void revokeInvitation(
                    invitation.id
                  );
                },
              },
            ]}
          />
        )}
      </AdminContentSection>

      <UserDetailSlideOver
        open={slideOverOpen}
        onClose={() => {
          setSelection(null);
          setSelectedInvitation(null);
          setDetail(null);
          setDetailError("");
          setAdminMessage("");
        }}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        invitation={selectedInvitation}
        adminMessage={adminMessage}
        inviteActionLoading={inviteActionLoading}
        onResendInvitation={resendInvitation}
        onRevokeInvitation={revokeInvitation}
        onTogglePlatformAdmin={togglePlatformAdmin}
        onDetailUpdated={async () => {
          if (selection?.kind === "user") {
            await loadDetail(selection.id);
          }
        }}
        onUserDeleted={async () => {
          setSelection(null);
          setSelectedInvitation(null);
          setDetail(null);
          setAdminMessage(
            "User permanently deleted from Home Tech Vault and Supabase Authentication."
          );
          await loadUsers();
        }}
      />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(message) => {
          setAdminMessage(message);
          setUserFilter("invited");
          setPage(1);
          void loadUsers();
        }}
      />
    </>
  );
}
