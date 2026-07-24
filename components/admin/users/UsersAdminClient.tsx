"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { Plus, RefreshCw, Users } from "lucide-react";

import PlanAccessAdminSection from "@/components/admin/users/PlanAccessAdminSection";
import FoundingMemberAdminSection from "@/components/admin/users/FoundingMemberAdminSection";
import AccountDangerZone from "@/components/admin/users/AccountDangerZone";
import InviteUserModal from "@/components/admin/users/InviteUserModal";
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
import {
  formatAdminHouseholdLabel,
  getAdminUserDisplayName,
} from "@/lib/admin/displayName";
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

type UsersAdminClientProps = {
  summary: {
    totalUsers: number;
    newUsersToday: number;
    activeSubscriptions: number;
    paidMembers: number;
  };
};

type DirectorySelection =
  | { kind: "user"; id: string }
  | { kind: "invitation"; id: string }
  | null;

export default function UsersAdminClient({
  summary,
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
  const [accountStatus, setAccountStatus] = useState("");
  const [householdRole, setHouseholdRole] = useState("");
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

      if (householdRole) {
        invitationParams.set("role", householdRole);
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
  }, [page, search, plan, adminFilter, householdRole]);

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

      const response = await fetch(`/api/admin/users/${userId}`);

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

  function selectInvitation(invitation: AdminPendingInvitation) {
    setSelection({ kind: "invitation", id: invitation.id });
    setSelectedInvitation(invitation);
    setDetail(null);
    setDetailError("");
    setAdminMessage("");
  }

  useEffect(() => {
    const selectedFromUrl = searchParams.get("selected");

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (accountStatus === "pending") {
        return false;
      }

      if (
        householdRole &&
        (user.householdRole || "").toLowerCase() !==
          householdRole
      ) {
        return false;
      }

      return true;
    });
  }, [users, accountStatus, householdRole]);

  const filteredInvitations = useMemo(() => {
    if (accountStatus === "active") {
      return [];
    }

    if (plan || adminFilter) {
      return [];
    }

    return invitations.filter((invitation) => {
      if (
        householdRole &&
        invitation.role !== householdRole
      ) {
        return false;
      }

      return true;
    });
  }, [
    invitations,
    accountStatus,
    plan,
    adminFilter,
    householdRole,
  ]);

  async function togglePlatformAdmin(nextValue: boolean) {
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

  async function resendInvitation(invitationId: string) {
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
          payload.error || "Unable to resend the invitation."
        );
      }

      setAdminMessage(payload.message || "Invitation resent.");
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

  async function revokeInvitation(invitationId: string) {
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
          payload.error || "Unable to revoke the invitation."
        );
      }

      setSelection(null);
      setSelectedInvitation(null);
      setAdminMessage(payload.message || "Invitation revoked.");
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
        repaired?: number;
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

  return (
    <>
      <AdminPageHero
        title="Users"
        description="Search accounts, invite new independent households or household members, and manage platform-admin access."
        action={
          <div className="flex flex-wrap gap-2">
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
              {repairLoading ? "Repairing…" : "Repair Missing Profiles"}
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
        <AdminFilterSelect
          label="Account status"
          value={accountStatus}
          onChange={(value) => {
            setPage(1);
            setAccountStatus(value);
          }}
          options={[
            { value: "active", label: "Active" },
            { value: "pending", label: "Invitation Pending" },
          ]}
        />
        <AdminFilterSelect
          label="Household role"
          value={householdRole}
          onChange={(value) => {
            setPage(1);
            setHouseholdRole(value);
          }}
          options={[
            { value: "admin", label: "Admin" },
            { value: "member", label: "Member" },
            { value: "viewer", label: "Viewer" },
          ]}
        />
      </AdminSearchFilters>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminContentSection
          id="users-directory-heading"
          title="User directory"
          subtitle="Select an account or pending invitation to inspect details."
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
          ) : (
            <AdminList>
              {filteredInvitations.map((invitation) => {
                const isNewAccount =
                  invitation.invitationType === "create_account";

                return (
                  <AdminListItem
                    key={`invitation-${invitation.id}`}
                    selected={
                      selection?.kind === "invitation" &&
                      selection.id === invitation.id
                    }
                    onClick={() => selectInvitation(invitation)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {invitation.email}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {isNewAccount
                            ? "New Account"
                            : invitation.householdName ||
                              "Unknown household"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <AdminStatusBadge tone="warning">
                            {isNewAccount
                              ? "Awaiting account setup"
                              : "Invitation Pending"}
                          </AdminStatusBadge>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm capitalize text-text-primary">
                          {isNewAccount
                            ? "New Account Invitation"
                            : invitation.role}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          Invited {formatAdminDate(invitation.createdAt)}
                        </p>
                        {isNewAccount ? (
                          <p className="mt-1 text-xs text-text-tertiary">
                            Expires{" "}
                            {formatAdminDate(invitation.expiresAt)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </AdminListItem>
                );
              })}

              {filteredUsers.map((user) => (
                <AdminListItem
                  key={user.id}
                  selected={
                    selection?.kind === "user" &&
                    selection.id === user.id
                  }
                  onClick={() => {
                    void loadDetail(user.id);
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {getAdminUserDisplayName({
                          fullName: user.fullName,
                          email: user.email,
                        })}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {user.email || "No email available"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.accountStatus === "deactivated" ? (
                          <AdminStatusBadge tone="danger">
                            Deactivated
                          </AdminStatusBadge>
                        ) : (
                          <AdminStatusBadge tone="success">
                            Active
                          </AdminStatusBadge>
                        )}
                        {user.isPlatformAdmin ? (
                          <AdminStatusBadge tone="warning">
                            Platform admin
                          </AdminStatusBadge>
                        ) : null}
                        {user.accountStatus === "deactivated" ? (
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
                        {user.isPlatformAdmin
                          ? "Platform admin"
                          : "Standard User"}
                      </p>
                      <p className="mt-1 text-xs capitalize text-text-secondary">
                        {formatAdminHouseholdLabel({
                          householdName: user.householdName,
                          householdId: user.householdId,
                        })}
                      </p>
                      <p className="mt-1 text-xs capitalize text-text-secondary">
                        {user.householdRole || "No household role"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {user.lastSignInAt
                          ? `Last sign-in ${formatAdminDate(user.lastSignInAt)}`
                          : "Last sign-in not available"}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        Joined {formatAdminDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </AdminListItem>
              ))}
            </AdminList>
          )}

          {pagination && accountStatus !== "pending" ? (
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalLabel={`${pagination.total} users`}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={pagination.hasNextPage}
              onPrevious={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              onNext={() => setPage((current) => current + 1)}
            />
          ) : null}
        </AdminContentSection>

        <AdminContentSection
          id="users-detail-heading"
          title="User detail"
          subtitle="Account context and administrative controls."
        >
          {!selection ? (
            <AdminEmptyState
              title="Select a user"
              description="Choose a row to inspect account or invitation details."
            />
          ) : selection.kind === "invitation" &&
            selectedInvitation ? (
            <div className="space-y-4">
              <AdminDetailField
                label="Email"
                value={selectedInvitation.email}
                copyValue={selectedInvitation.email}
                onCopy={() => {
                  void navigator.clipboard.writeText(
                    selectedInvitation.email
                  );
                }}
              />
              <AdminDetailField
                label="Invitation type"
                value={
                  selectedInvitation.invitationType ===
                  "create_account"
                    ? "New Account Invitation"
                    : "Household Invitation"
                }
              />
              {selectedInvitation.invitationType ===
              "join_household" ? (
                <>
                  <AdminDetailField
                    label="Household"
                    value={
                      selectedInvitation.householdName ||
                      selectedInvitation.householdId ||
                      "—"
                    }
                  />
                  <AdminDetailField
                    label="Selected role"
                    value={selectedInvitation.role || "—"}
                  />
                </>
              ) : (
                <AdminDetailField
                  label="Setup status"
                  value="Awaiting account setup"
                />
              )}
              {(selectedInvitation.firstName ||
                selectedInvitation.lastName) && (
                <AdminDetailField
                  label="Suggested name"
                  value={[
                    selectedInvitation.firstName,
                    selectedInvitation.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
              <AdminDetailField
                label="Invited by"
                value={
                  selectedInvitation.invitedByName ||
                  selectedInvitation.invitedByEmail ||
                  selectedInvitation.invitedBy ||
                  "—"
                }
              />
              <AdminDetailField
                label="Date invited"
                value={formatAdminDate(selectedInvitation.createdAt)}
              />
              <AdminDetailField
                label="Expiration date"
                value={formatAdminDate(selectedInvitation.expiresAt)}
              />
              <AdminDetailField
                label="Invitation status"
                value={
                  selectedInvitation.invitationType ===
                  "create_account"
                    ? "Awaiting account setup"
                    : "Invitation Pending"
                }
              />

              {adminMessage ? (
                <p className="text-sm text-text-secondary">
                  {adminMessage}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    void resendInvitation(selectedInvitation.id);
                  }}
                  disabled={inviteActionLoading}
                >
                  Resend Invitation
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void revokeInvitation(selectedInvitation.id);
                  }}
                  disabled={inviteActionLoading}
                >
                  Revoke Invitation
                </Button>
              </div>

              {selectedInvitation.invitationType ===
                "join_household" &&
              selectedInvitation.householdId ? (
                <Link
                  href={`/admin/households?selected=${selectedInvitation.householdId}`}
                  className="inline-flex text-sm font-semibold text-interaction"
                >
                  View household
                </Link>
              ) : null}
            </div>
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
                  void navigator.clipboard.writeText(detail.id);
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
                value={formatAdminHouseholdLabel({
                  householdName: detail.householdName,
                  householdId: detail.householdId,
                })}
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
                  if (selection?.kind === "user") {
                    await loadDetail(selection.id);
                  }
                }}
              />

              <FoundingMemberAdminSection
                detail={detail}
                onUpdated={async () => {
                  if (selection?.kind === "user") {
                    await loadDetail(selection.id);
                  }
                }}
              />

              <AccountDangerZone
                detail={detail}
                onUpdated={async () => {
                  if (selection?.kind === "user") {
                    await loadDetail(selection.id);
                  }

                  void loadUsers();
                }}
              />

              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Platform admin access
                </p>

                {adminMessage ? (
                  <p className="mt-2 text-sm text-text-secondary">
                    {adminMessage}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.isPlatformAdmin ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        void togglePlatformAdmin(false);
                      }}
                    >
                      Remove platform admin
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        void togglePlatformAdmin(true);
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

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(message) => {
          setAdminMessage(message);
          setAccountStatus("pending");
          setPage(1);
          void loadUsers();
        }}
      />
    </>
  );
}
