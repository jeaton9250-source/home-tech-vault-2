"use client";

import AdminStatusChip, {
  userStatusChipTone,
} from "@/components/admin/ui/AdminStatusChip";
import AdminRowActionsMenu, {
  AdminMobileCard,
  AdminMobileCards,
  AdminTableShell,
  type AdminRowAction,
} from "@/components/admin/ui/AdminRowActionsMenu";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminPendingInvitation } from "@/lib/admin/types";

type InvitationsDirectoryTableProps = {
  invitations: AdminPendingInvitation[];
  selectedInvitationId: string | null;
  onSelect: (invitation: AdminPendingInvitation) => void;
  buildActions: (
    invitation: AdminPendingInvitation
  ) => AdminRowAction[];
};

export default function InvitationsDirectoryTable({
  invitations,
  selectedInvitationId,
  onSelect,
  buildActions,
}: InvitationsDirectoryTableProps) {
  return (
    <>
      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-sunken/60">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr
                key={invitation.id}
                onClick={() => onSelect(invitation)}
                className={
                  selectedInvitationId === invitation.id
                    ? "cursor-pointer bg-surface-sunken/80"
                    : "cursor-pointer border-t border-border-subtle transition hover:bg-surface-sunken/50"
                }
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {invitation.email}
                </td>
                <td className="px-4 py-3 capitalize">
                  {invitation.invitationType.replace(
                    "_",
                    " "
                  )}
                </td>
                <td className="px-4 py-3">
                  {formatAdminDate(invitation.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {formatAdminDate(invitation.expiresAt)}
                </td>
                <td className="px-4 py-3">
                  <AdminStatusChip
                    tone={userStatusChipTone(
                      invitation.status === "expired"
                        ? "expired"
                        : "pending"
                    )}
                  >
                    {invitation.status === "expired"
                      ? "Expired"
                      : "Pending"}
                  </AdminStatusChip>
                </td>
                <td
                  className="px-4 py-3"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <AdminRowActionsMenu
                    actions={buildActions(invitation)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminMobileCards>
        {invitations.map((invitation) => (
          <AdminMobileCard
            key={invitation.id}
            selected={
              selectedInvitationId === invitation.id
            }
            onClick={() => onSelect(invitation)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-text-primary">
                  {invitation.email}
                </p>
                <p className="mt-1 text-sm capitalize text-text-secondary">
                  {invitation.invitationType.replace(
                    "_",
                    " "
                  )}
                </p>
              </div>
              <AdminRowActionsMenu
                actions={buildActions(invitation)}
              />
            </div>
            <div className="mt-3">
              <AdminStatusChip
                tone={userStatusChipTone(
                  invitation.status === "expired"
                    ? "expired"
                    : "pending"
                )}
              >
                {invitation.status === "expired"
                  ? "Expired"
                  : "Pending"}
              </AdminStatusChip>
            </div>
          </AdminMobileCard>
        ))}
      </AdminMobileCards>
    </>
  );
}
