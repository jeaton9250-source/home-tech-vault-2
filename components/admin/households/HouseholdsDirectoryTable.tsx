"use client";

import AdminRowActionsMenu, {
  AdminMobileCard,
  AdminMobileCards,
  AdminTableShell,
  type AdminRowAction,
} from "@/components/admin/ui/AdminRowActionsMenu";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminHouseholdSummary } from "@/lib/admin/types";

type HouseholdsDirectoryTableProps = {
  households: AdminHouseholdSummary[];
  selectedHouseholdId: string | null;
  onSelect: (householdId: string) => void;
  buildActions: (
    household: AdminHouseholdSummary
  ) => AdminRowAction[];
};

export default function HouseholdsDirectoryTable({
  households,
  selectedHouseholdId,
  onSelect,
  buildActions,
}: HouseholdsDirectoryTableProps) {
  return (
    <>
      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-sunken/60">
            <tr>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Devices</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Connectors</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {households.map((household) => (
              <tr
                key={household.id}
                onClick={() => onSelect(household.id)}
                className={
                  selectedHouseholdId === household.id
                    ? "cursor-pointer bg-surface-sunken/80"
                    : "cursor-pointer border-t border-border-subtle transition hover:bg-surface-sunken/50"
                }
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {household.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {household.ownerName ||
                    household.ownerEmail ||
                    household.ownerId}
                </td>
                <td className="px-4 py-3">
                  {household.memberCount}
                </td>
                <td className="px-4 py-3">
                  {household.deviceCount}
                </td>
                <td className="px-4 py-3 capitalize">
                  {household.inheritedPlan}
                </td>
                <td className="px-4 py-3">
                  {formatAdminDate(household.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {household.connectorCount}
                </td>
                <td
                  className="px-4 py-3"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <AdminRowActionsMenu
                    actions={buildActions(household)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminMobileCards>
        {households.map((household) => (
          <AdminMobileCard
            key={household.id}
            selected={
              selectedHouseholdId === household.id
            }
            onClick={() => onSelect(household.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-text-primary">
                  {household.name}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {household.ownerName ||
                    household.ownerEmail}
                </p>
              </div>
              <AdminRowActionsMenu
                actions={buildActions(household)}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-text-secondary">
              <span>{household.memberCount} members</span>
              <span>{household.deviceCount} devices</span>
              <span className="capitalize">
                {household.inheritedPlan}
              </span>
              <span>
                {household.connectorCount} connectors
              </span>
            </div>
          </AdminMobileCard>
        ))}
      </AdminMobileCards>
    </>
  );
}
