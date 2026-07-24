"use client";

import AdminStatusChip from "@/components/admin/ui/AdminStatusChip";
import AdminRowActionsMenu, {
  AdminMobileCard,
  AdminMobileCards,
  AdminTableShell,
  type AdminRowAction,
} from "@/components/admin/ui/AdminRowActionsMenu";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminSubscriptionRow } from "@/lib/admin/types";

type SubscriptionsDirectoryTableProps = {
  rows: AdminSubscriptionRow[];
  buildActions: (
    row: AdminSubscriptionRow
  ) => AdminRowAction[];
};

function statusTone(
  status: string
): "success" | "warning" | "danger" | "neutral" {
  if (status === "active" || status === "trialing") {
    return "success";
  }

  if (status === "past_due") {
    return "warning";
  }

  if (status === "canceled" || status === "inactive") {
    return "danger";
  }

  return "neutral";
}

export default function SubscriptionsDirectoryTable({
  rows,
  buildActions,
}: SubscriptionsDirectoryTableProps) {
  return (
    <>
      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-sunken/60">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Stripe Customer</th>
              <th className="px-4 py-3">Renewal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.userId}
                className="border-t border-border-subtle transition hover:bg-surface-sunken/50"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">
                    {row.fullName ||
                      row.email ||
                      row.userId}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {row.email}
                  </p>
                </td>
                <td className="px-4 py-3 capitalize">
                  {row.effectivePlan}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.stripeCustomerId || "—"}
                </td>
                <td className="px-4 py-3">
                  {formatAdminDate(row.currentPeriodEnd)}
                </td>
                <td className="px-4 py-3">
                  <AdminStatusChip tone={statusTone(row.status)}>
                    {row.status}
                  </AdminStatusChip>
                </td>
                <td className="px-4 py-3 capitalize text-text-secondary">
                  {row.billingSource.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <AdminRowActionsMenu
                    actions={buildActions(row)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminMobileCards>
        {rows.map((row) => (
          <AdminMobileCard key={row.userId}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-text-primary">
                  {row.fullName ||
                    row.email ||
                    row.userId}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {row.email}
                </p>
              </div>
              <AdminRowActionsMenu
                actions={buildActions(row)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminStatusChip tone={statusTone(row.status)}>
                {row.status}
              </AdminStatusChip>
              <AdminStatusChip tone="neutral" dot={false}>
                {row.effectivePlan}
              </AdminStatusChip>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              Renewal {formatAdminDate(row.currentPeriodEnd)}
            </p>
          </AdminMobileCard>
        ))}
      </AdminMobileCards>
    </>
  );
}
