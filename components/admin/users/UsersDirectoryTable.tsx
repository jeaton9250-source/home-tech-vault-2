"use client";

import AdminStatusChip, {
  userStatusChipTone,
} from "@/components/admin/ui/AdminStatusChip";
import AdminRowActionsMenu, {
  AdminMobileCard,
  AdminMobileCards,
  AdminSortButton,
  AdminTableShell,
  type AdminRowAction,
} from "@/components/admin/ui/AdminRowActionsMenu";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import {
  formatAdminHouseholdLabel,
  getAdminUserDisplayName,
} from "@/lib/admin/displayName";
import {
  resolveUserDisplayStatus,
  USER_STATUS_LABELS,
} from "@/lib/admin/userStatus";
import type { AdminUserSummary } from "@/lib/admin/types";

export type UserSortKey =
  | "name"
  | "joined"
  | "lastActive"
  | "devices"
  | "plan";

type UsersDirectoryTableProps = {
  users: AdminUserSummary[];
  selectedUserId: string | null;
  sortKey: UserSortKey;
  sortDirection: "asc" | "desc";
  onSort: (key: UserSortKey) => void;
  onSelect: (userId: string) => void;
  buildActions: (
    user: AdminUserSummary
  ) => AdminRowAction[];
};

function UserAvatar({
  user,
}: {
  user: AdminUserSummary;
}) {
  const label = getAdminUserDisplayName({
    fullName: user.fullName,
    email: user.email,
  });

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-text-primary">
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function UsersDirectoryTable({
  users,
  selectedUserId,
  sortKey,
  sortDirection,
  onSort,
  onSelect,
  buildActions,
}: UsersDirectoryTableProps) {
  return (
    <>
      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-sunken/60">
            <tr>
              <th className="px-4 py-3">Avatar</th>
              <th className="px-4 py-3">
                <AdminSortButton
                  label="Name"
                  active={sortKey === "name"}
                  direction={sortDirection}
                  onClick={() => onSort("name")}
                />
              </th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <AdminSortButton
                  label="Plan"
                  active={sortKey === "plan"}
                  direction={sortDirection}
                  onClick={() => onSort("plan")}
                />
              </th>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">
                <AdminSortButton
                  label="Devices"
                  active={sortKey === "devices"}
                  direction={sortDirection}
                  onClick={() => onSort("devices")}
                />
              </th>
              <th className="px-4 py-3">
                <AdminSortButton
                  label="Joined"
                  active={sortKey === "joined"}
                  direction={sortDirection}
                  onClick={() => onSort("joined")}
                />
              </th>
              <th className="px-4 py-3">
                <AdminSortButton
                  label="Last Active"
                  active={sortKey === "lastActive"}
                  direction={sortDirection}
                  onClick={() => onSort("lastActive")}
                />
              </th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const status =
                resolveUserDisplayStatus(user);

              return (
                <tr
                  key={user.id}
                  onClick={() => onSelect(user.id)}
                  className={
                    selectedUserId === user.id
                      ? "cursor-pointer bg-surface-sunken/80"
                      : "cursor-pointer border-t border-border-subtle transition hover:bg-surface-sunken/50"
                  }
                >
                  <td className="px-4 py-3">
                    <UserAvatar user={user} />
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {getAdminUserDisplayName({
                      fullName: user.fullName,
                      email: user.email,
                    })}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusChip
                      tone={userStatusChipTone(status)}
                    >
                      {USER_STATUS_LABELS[status]}
                    </AdminStatusChip>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {user.personalPlan}
                  </td>
                  <td className="px-4 py-3">
                    {formatAdminHouseholdLabel({
                      householdName:
                        user.householdName,
                      householdId: user.householdId,
                    })}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {user.householdRole || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {user.deviceCount}
                  </td>
                  <td className="px-4 py-3">
                    {formatAdminDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {formatAdminDate(user.lastSignInAt)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <AdminRowActionsMenu
                      actions={buildActions(user)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminMobileCards>
        {users.map((user) => {
          const status =
            resolveUserDisplayStatus(user);

          return (
            <AdminMobileCard
              key={user.id}
              selected={selectedUserId === user.id}
              onClick={() => onSelect(user.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} />
                  <div>
                    <p className="font-medium text-text-primary">
                      {getAdminUserDisplayName({
                        fullName: user.fullName,
                        email: user.email,
                      })}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {user.email}
                    </p>
                  </div>
                </div>
                <AdminRowActionsMenu
                  actions={buildActions(user)}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminStatusChip
                  tone={userStatusChipTone(status)}
                >
                  {USER_STATUS_LABELS[status]}
                </AdminStatusChip>
                <AdminStatusChip tone="neutral" dot={false}>
                  {user.personalPlan}
                </AdminStatusChip>
              </div>
            </AdminMobileCard>
          );
        })}
      </AdminMobileCards>
    </>
  );
}
