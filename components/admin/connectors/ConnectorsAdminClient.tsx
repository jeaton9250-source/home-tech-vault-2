"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHero,
  AdminSearchField,
  AdminSearchFilters,
} from "@/components/admin/layout/AdminPageLayout";
import AdminFilterPills from "@/components/admin/ui/AdminFilterPills";
import AdminStatusChip, {
  userStatusChipTone,
} from "@/components/admin/ui/AdminStatusChip";
import AdminExportMenu from "@/components/admin/ui/AdminExportMenu";
import {
  AdminMobileCard,
  AdminMobileCards,
  AdminTableShell,
} from "@/components/admin/ui/AdminRowActionsMenu";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import type { AdminConnectorRow } from "@/lib/admin/controlCenterTypes";

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "online", label: "Online" },
  { id: "idle", label: "Idle" },
  { id: "offline", label: "Offline" },
  { id: "revoked", label: "Revoked" },
];

function connectorTone(
  status: AdminConnectorRow["status"]
) {
  switch (status) {
    case "online":
      return "success";
    case "idle":
      return "warning";
    case "offline":
    case "revoked":
      return "danger";
    default:
      return "neutral";
  }
}

export default function ConnectorsAdminClient() {
  const [connectors, setConnectors] = useState<
    AdminConnectorRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadConnectors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/connectors?${params.toString()}`,
        { cache: "no-store" }
      );

      const payload = (await response.json()) as {
        connectors?: AdminConnectorRow[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load connectors."
        );
      }

      setConnectors(payload.connectors ?? []);
    } catch (loadError) {
      setConnectors([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load connectors."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConnectors();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadConnectors]);

  const rows = useMemo(() => connectors, [connectors]);

  return (
    <>
      <AdminPageHero
        title="Connectors"
        description="Monitor connector installations, heartbeat health, and household coverage."
        action={
          <AdminExportMenu kinds={["activity"]} />
        }
      />

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search household, device, or OS"
        />
      </AdminSearchFilters>

      <AdminFilterPills
        options={STATUS_FILTERS}
        value={status}
        onChange={setStatus}
      />

      <AdminContentSection title="Connector installations">
        {loading ? (
          <AdminLoadingState label="Loading connectors…" />
        ) : error ? (
          <AdminErrorState message={error} />
        ) : rows.length === 0 ? (
          <AdminEmptyState
            title="No connector installations"
            description="Connector heartbeat data will appear here once households install the desktop monitor."
          />
        ) : (
          <>
            <AdminTableShell>
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border-subtle bg-surface-sunken/60">
                  <tr>
                    <th className="px-4 py-3">Household</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">OS</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Last Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border-subtle"
                    >
                      <td className="px-4 py-3">
                        {row.householdName || row.householdId}
                      </td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.appVersion || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.platform || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusChip
                          tone={connectorTone(row.status)}
                        >
                          {row.status}
                        </AdminStatusChip>
                      </td>
                      <td className="px-4 py-3">
                        {formatAdminDate(row.lastSeenAt)}
                      </td>
                      <td className="px-4 py-3">
                        {formatAdminDate(row.lastScanAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>

            <AdminMobileCards>
              {rows.map((row) => (
                <AdminMobileCard key={row.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-primary">
                        {row.name}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {row.householdName || row.householdId}
                      </p>
                    </div>
                    <AdminStatusChip
                      tone={connectorTone(row.status)}
                    >
                      {row.status}
                    </AdminStatusChip>
                  </div>
                </AdminMobileCard>
              ))}
            </AdminMobileCards>
          </>
        )}
      </AdminContentSection>
    </>
  );
}
