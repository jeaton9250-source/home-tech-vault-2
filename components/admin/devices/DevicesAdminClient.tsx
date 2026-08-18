"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  Home,
  MoreHorizontal,
  X,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import {
  AdminContentSection,
  AdminDetailField,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterSelect,
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
import DropdownMenu, {
  closeMenuOnSelect,
} from "@/components/navigation/DropdownMenu";
import { useNavMenu } from "@/hooks/useNavMenu";
import {
  getAdminDeviceOnlineLabel,
  getAdminOnlineBadgeTone,
  getAdminWarrantyBadgeTone,
  getAdminWarrantyLabel,
} from "@/lib/admin/devices/status";
import type {
  AdminDeviceDetail,
  AdminDeviceListSummary,
  AdminDeviceSummary,
} from "@/lib/admin/types";
import { formatLastSeen } from "@/lib/devices/deviceProfileUtils";
import { cn } from "@/lib/design-system/cn";

type DevicesResponse = {
  devices: AdminDeviceSummary[];
  summary: AdminDeviceListSummary;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: {
    categories: string[];
    households: Array<{ value: string; label: string }>;
  };
  error?: string;
};

type DevicesAdminClientProps = {
  initialSummary: AdminDeviceListSummary;
};

function displayValue(value: string | null | undefined) {
  return value?.trim() || "Not available";
}

function buildBrandModel(device: AdminDeviceSummary) {
  return [device.brand, device.modelNumber]
    .filter(Boolean)
    .join(" · ");
}

export default function DevicesAdminClient({
  initialSummary,
}: DevicesAdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [devices, setDevices] = useState<
    AdminDeviceSummary[]
  >([]);
  const [summary, setSummary] =
    useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] =
    useState<
      DevicesResponse["pagination"] | null
    >(null);
  const [categories, setCategories] = useState<
    string[]
  >([]);
  const [households, setHouseholds] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [drawerDeviceId, setDrawerDeviceId] =
    useState<string | null>(null);
  const [drawerDevice, setDrawerDevice] =
    useState<AdminDeviceDetail | null>(null);
  const [drawerLoading, setDrawerLoading] =
    useState(false);
  const [drawerError, setDrawerError] =
    useState("");
  const [copyMessage, setCopyMessage] =
    useState("");

  const search = searchParams.get("q") ?? "";
  const online = searchParams.get("online") ?? "";
  const category =
    searchParams.get("category") ?? "";
  const warranty =
    searchParams.get("warranty") ?? "";
  const household =
    searchParams.get("household") ?? "";
  const createdFrom =
    searchParams.get("createdFrom") ?? "";
  const createdTo =
    searchParams.get("createdTo") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const requestedLimit = Number(
    searchParams.get("limit") ?? "5"
  );

  const limit = [5, 10, 25].includes(
    requestedLimit
  )
    ? requestedLimit
    : 5;

  const filtersActive = useMemo(
    () =>
      Boolean(
        search.trim() ||
          online ||
          category ||
          warranty ||
          household ||
          createdFrom ||
          createdTo
      ),
    [
      search,
      online,
      category,
      warranty,
      household,
      createdFrom,
      createdTo,
    ]
  );

  const updateParams = useCallback(
    (
      updates: Record<
        string,
        string | number | null | undefined
      >
    ) => {
      const params = new URLSearchParams(
        searchParams.toString()
      );

      for (const [key, value] of Object.entries(
        updates
      )) {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      router.replace(
        `/admin/devices?${params.toString()}`
      );
    },
    [router, searchParams]
  );

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page > 0 ? page : 1),
        limit: String(limit),
        sort,
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (online) {
        params.set("online", online);
      }

      if (category) {
        params.set("category", category);
      }

      if (warranty) {
        params.set("warranty", warranty);
      }

      if (household) {
        params.set("household", household);
      }

      if (createdFrom) {
        params.set("createdFrom", createdFrom);
      }

      if (createdTo) {
        params.set("createdTo", createdTo);
      }

      const response = await fetch(
        `/api/admin/devices?${params.toString()}`
      );

      const payload =
        (await response.json()) as DevicesResponse;

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to load devices."
        );
      }

      setDevices(payload.devices);
      setSummary(payload.summary);
      setPagination(payload.pagination);
      setCategories(payload.filters?.categories ?? []);
      setHouseholds(
        payload.filters?.households ?? []
      );
    } catch (loadError) {
      setDevices([]);
      setPagination(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load devices."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    online,
    category,
    warranty,
    household,
    createdFrom,
    createdTo,
    sort,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDevices();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDevices]);

  useEffect(() => {
    if (!drawerDeviceId) {
      setDrawerDevice(null);
      setDrawerError("");
      return;
    }

    let cancelled = false;

    async function loadDrawer() {
      try {
        setDrawerLoading(true);
        setDrawerError("");

        const response = await fetch(
          `/api/admin/devices/${drawerDeviceId}`
        );

        const payload =
          (await response.json()) as {
            device?: AdminDeviceDetail;
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load device details."
          );
        }

        if (!cancelled) {
          setDrawerDevice(payload.device ?? null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDrawerDevice(null);
          setDrawerError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load device details."
          );
        }
      } finally {
        if (!cancelled) {
          setDrawerLoading(false);
        }
      }
    }

    void loadDrawer();

    return () => {
      cancelled = true;
    };
  }, [drawerDeviceId]);

  async function copyDeviceId(deviceId: string) {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopyMessage("Device ID copied.");
      window.setTimeout(() => {
        setCopyMessage("");
      }, 2000);
    } catch {
      setCopyMessage("Unable to copy device ID.");
    }
  }

  const summaryHint =
    summary.scope === "filtered"
      ? "Counts reflect the current filters."
      : "Platform-wide totals.";

  return (
    <>
      <AdminPageHero
        title="Devices"
        description="Read-only cross-household device directory for platform troubleshooting. Customer device data cannot be edited from Control Center."
      />

      {copyMessage ? (
        <p className="rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary shadow-[var(--shadow-sm)]">
          {copyMessage}
        </p>
      ) : null}

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Total devices"
          value={summary.totalDevices}
          hint={summaryHint}
          icon={
            <Cpu
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
        <AdminSummaryCard
          label="Online"
          value={summary.online}
          hint={summaryHint}
        />
        <AdminSummaryCard
          label="Offline"
          value={summary.offline}
          hint={summaryHint}
        />
        <AdminSummaryCard
          label="Unknown"
          value={summary.unknown}
          hint={summaryHint}
        />
        <AdminSummaryCard
          label="Expiring warranties"
          value={summary.expiringWarranties}
          hint={summaryHint}
        />
      </AdminSummaryGrid>

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2 xl:col-span-3"
          value={search}
          onChange={(value) => {
            updateParams({ q: value, page: 1 });
          }}
          placeholder="Search device name, brand, model, serial, household, or owner email"
        />
        <AdminFilterSelect
          label="Online status"
          value={online}
          onChange={(value) => {
            updateParams({ online: value, page: 1 });
          }}
          options={[
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            {
              value: "unknown",
              label: "Unknown",
            },
          ]}
        />
        <AdminFilterSelect
          label="Category"
          value={category}
          onChange={(value) => {
            updateParams({
              category: value,
              page: 1,
            });
          }}
          options={categories.map((entry) => ({
            value: entry,
            label: entry,
          }))}
        />
        <AdminFilterSelect
          label="Warranty status"
          value={warranty}
          onChange={(value) => {
            updateParams({
              warranty: value,
              page: 1,
            });
          }}
          options={[
            { value: "active", label: "Active" },
            {
              value: "expiring",
              label: "Expiring Soon",
            },
            { value: "expired", label: "Expired" },
            { value: "missing", label: "Missing" },
          ]}
        />
        <AdminFilterSelect
          label="Household"
          value={household}
          onChange={(value) => {
            updateParams({
              household: value,
              page: 1,
            });
          }}
          options={households}
        />
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            Created from
          </span>
          <input
            type="date"
            value={createdFrom}
            onChange={(event) => {
              updateParams({
                createdFrom: event.target.value,
                page: 1,
              });
            }}
            className="w-full rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm text-text-primary shadow-[var(--shadow-sm)] outline-none transition focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            Created to
          </span>
          <input
            type="date"
            value={createdTo}
            onChange={(event) => {
              updateParams({
                createdTo: event.target.value,
                page: 1,
              });
            }}
            className="w-full rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm text-text-primary shadow-[var(--shadow-sm)] outline-none transition focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
          />
        </label>
        <AdminFilterSelect
          label="Sort by"
          value={sort}
          onChange={(value) => {
            updateParams({ sort: value, page: 1 });
          }}
          includeAll={false}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            {
              value: "name",
              label: "Device name",
            },
            {
              value: "household",
              label: "Household",
            },
            {
              value: "last_seen",
              label: "Last seen",
            },
            {
              value: "warranty",
              label: "Warranty expiration",
            },
          ]}
        />
      </AdminSearchFilters>

      <AdminContentSection
        title="Device directory"
        subtitle="Read-only inventory across all customer households."
      >
        <div className="mb-4 flex flex-col gap-3 rounded-[18px] border border-[#e1dbd1] bg-[#faf7f1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#18202b]">
              {pagination
                ? `${pagination.total.toLocaleString()} device${
                    pagination.total === 1
                      ? ""
                      : "s"
                  }`
                : `${summary.totalDevices.toLocaleString()} devices`}
            </p>

            <p className="mt-0.5 text-xs text-[#6f6a62]">
              Showing a smaller set at a time
              for easier review.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5f5b55]">
            <span className="font-medium">
              Rows
            </span>

            <select
              value={limit}
              onChange={(event) => {
                updateParams({
                  limit:
                    Number(
                      event.target.value
                    ),
                  page: 1,
                });
              }}
              className="h-9 rounded-xl border border-[#dcd6cc] bg-[#fffdf9] px-3 text-sm font-medium text-[#18202b] outline-none transition focus:border-[#718d4f]/50 focus:ring-2 focus:ring-[#718d4f]/10"
            >
              <option value="5">
                5
              </option>
              <option value="10">
                10
              </option>
              <option value="25">
                25
              </option>
            </select>
          </label>
        </div>

        {loading ? (
          <AdminLoadingState label="Loading devices…" />
        ) : error ? (
          <div className="space-y-4">
            <AdminErrorState message={error} />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void loadDevices();
              }}
            >
              Retry
            </Button>
          </div>
        ) : devices.length === 0 ? (
          <AdminEmptyState
            title={
              filtersActive
                ? "No devices match these filters"
                : "No devices found"
            }
            description={
              filtersActive
                ? "Try clearing a filter or broadening your search."
                : "Devices will appear here once customers add inventory."
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e3ddd3] bg-[#faf7f1] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6a62]">
                    <th className="px-4 py-3.5">
                      Device
                    </th>
                    <th className="px-4 py-3.5">
                      Household
                    </th>
                    <th className="px-4 py-3.5">
                      Category
                    </th>
                    <th className="px-4 py-3.5">
                      Status
                    </th>
                    <th className="px-4 py-3.5">
                      Warranty
                    </th>
                    <th className="px-4 py-3.5 text-center">
                      Docs
                    </th>
                    <th className="px-4 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <DeviceTableRow
                      key={device.id}
                      device={device}
                      onOpenDrawer={() => {
                        setDrawerDeviceId(device.id);
                      }}
                      onCopyDeviceId={() => {
                        void copyDeviceId(device.id);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {devices.map((device) => (
                <DeviceMobileCard
                  key={device.id}
                  device={device}
                  onOpenDrawer={() => {
                    setDrawerDeviceId(device.id);
                  }}
                  onCopyDeviceId={() => {
                    void copyDeviceId(device.id);
                  }}
                />
              ))}
            </div>

            {pagination ? (
              <AdminPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalLabel={`${pagination.total.toLocaleString()} devices`}
                hasPreviousPage={
                  pagination.hasPreviousPage
                }
                hasNextPage={pagination.hasNextPage}
                onPrevious={() => {
                  updateParams({
                    page: Math.max(
                      1,
                      pagination.page - 1
                    ),
                  });
                }}
                onNext={() => {
                  updateParams({
                    page: pagination.page + 1,
                  });
                }}
              />
            ) : null}
          </>
        )}
      </AdminContentSection>

      {drawerDeviceId ? (
        <AdminDeviceDrawer
          loading={drawerLoading}
          error={drawerError}
          device={drawerDevice}
          onClose={() => {
            setDrawerDeviceId(null);
          }}
          onCopyDeviceId={() => {
            if (drawerDeviceId) {
              void copyDeviceId(drawerDeviceId);
            }
          }}
        />
      ) : null}
    </>
  );
}

function DeviceTableRow({
  device,
  onOpenDrawer,
  onCopyDeviceId,
}: {
  device: AdminDeviceSummary;
  onOpenDrawer: () => void;
  onCopyDeviceId: () => void;
}) {
  return (
    <tr className="group border-b border-[#e7e1d7] transition-colors last:border-b-0 hover:bg-[#faf7f1]">
      <td className="px-4 py-4 align-middle">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex min-w-[240px] items-center gap-3 text-left"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#e1dbd1] bg-[#f5f1e9]">
            <DeviceImageDisplay
              device={{
                id: device.id,
                device_name:
                  device.deviceName,
                brand: device.brand,
                category: device.category,
                photo_url: device.photoUrl,
              }}
              variant="thumbnail"
              className="h-full w-full"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#18202b] group-hover:text-[#617c43]">
              {device.deviceName ||
                "Unnamed device"}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#68635d]">
              {buildBrandModel(device) ||
                "Brand/model not available"}
            </p>

            {device.serialNumber ? (
              <p className="mt-0.5 truncate text-[11px] text-[#8c867e]">
                SN {device.serialNumber}
              </p>
            ) : null}
          </div>
        </button>
      </td>

      <td className="px-4 py-4 align-middle">
        {device.householdId ? (
          <div className="min-w-[150px]">
            <Link
              href={`/admin/households?${new URLSearchParams({
                q: device.householdId,
              }).toString()}`}
              className="text-sm font-medium text-[#18202b] underline-offset-4 hover:text-[#617c43] hover:underline"
            >
              {device.householdName ||
                "Unknown household"}
            </Link>

            {device.householdOwnerName ||
            device.householdOwnerEmail ? (
              <p className="mt-1 max-w-[190px] truncate text-xs text-[#777169]">
                {device.householdOwnerName ||
                  device.householdOwnerEmail}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-[#777169]">
            Not assigned
          </span>
        )}
      </td>

      <td className="px-4 py-4 align-middle text-sm text-[#5f5b55]">
        {device.category || "—"}
      </td>

      <td className="px-4 py-4 align-middle">
        <AdminStatusBadge
          tone={getAdminOnlineBadgeTone(
            device.onlineStatus
          )}
        >
          {getAdminDeviceOnlineLabel(
            device.onlineStatus
          )}
        </AdminStatusBadge>

        <p className="mt-1.5 text-xs text-[#777169]">
          {formatLastSeen(
            device.lastSeenAt
          ) || "No recent activity"}
        </p>
      </td>

      <td className="px-4 py-4 align-middle">
        <AdminStatusBadge
          tone={getAdminWarrantyBadgeTone(
            device.warrantyStatus
          )}
        >
          {getAdminWarrantyLabel(
            device.warrantyStatus
          )}
        </AdminStatusBadge>
      </td>

      <td className="px-4 py-4 text-center align-middle text-sm font-semibold text-[#18202b]">
        {device.documentCount}
      </td>

      <td className="px-4 py-4 text-right align-middle">
        <DeviceActionsMenu
          device={device}
          onOpenDrawer={onOpenDrawer}
          onCopyDeviceId={
            onCopyDeviceId
          }
        />
      </td>
    </tr>
  );
}

function DeviceMobileCard({
  device,
  onOpenDrawer,
  onCopyDeviceId,
}: {
  device: AdminDeviceSummary;
  onOpenDrawer: () => void;
  onCopyDeviceId: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-sunken p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
            <DeviceImageDisplay
              device={{
                id: device.id,
                device_name: device.deviceName,
                brand: device.brand,
                category: device.category,
                photo_url: device.photoUrl,
              }}
              variant="thumbnail"
              className="h-full w-full"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-primary">
              {device.deviceName || "Unnamed device"}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {device.householdName || "Unknown household"}
            </p>
          </div>
        </div>
        <DeviceActionsMenu
          device={device}
          onOpenDrawer={onOpenDrawer}
          onCopyDeviceId={onCopyDeviceId}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <AdminStatusBadge
          tone={getAdminOnlineBadgeTone(
            device.onlineStatus
          )}
        >
          {getAdminDeviceOnlineLabel(
            device.onlineStatus
          )}
        </AdminStatusBadge>
        <AdminStatusBadge
          tone={getAdminWarrantyBadgeTone(
            device.warrantyStatus
          )}
        >
          {getAdminWarrantyLabel(
            device.warrantyStatus
          )}
        </AdminStatusBadge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-text-tertiary">
            Last seen
          </dt>
          <dd className="mt-1 text-text-secondary">
            {formatLastSeen(device.lastSeenAt) || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-text-tertiary">
            Warranty
          </dt>
          <dd className="mt-1 text-text-secondary">
            {getAdminWarrantyLabel(
              device.warrantyStatus
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function DeviceActionsMenu({
  device,
  onOpenDrawer,
  onCopyDeviceId,
}: {
  device: AdminDeviceSummary;
  onOpenDrawer: () => void;
  onCopyDeviceId: () => void;
}) {
  const { closeMenu } = useNavMenu();

  return (
    <DropdownMenu
      menuId={`admin-device-${device.id}`}
      align="end"
      widthClass="w-[min(100vw-2rem,260px)]"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-text-secondary transition hover:bg-surface-sunken"
          aria-label={`Actions for ${device.deviceName || "device"}`}
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    >
      <div className="p-2">
        <DeviceActionButton
          icon={<Eye size={15} />}
          label="View Device Details"
          onClick={closeMenuOnSelect(() => {
            closeMenu();
            onOpenDrawer();
          })}
        />
        {device.householdId ? (
          <DeviceActionButton
            icon={<Home size={15} />}
            label="View Household"
            href={`/admin/households?${new URLSearchParams({ q: device.householdId }).toString()}`}
            onClick={closeMenuOnSelect(closeMenu)}
          />
        ) : null}
        <DeviceActionButton
          icon={<ExternalLink size={15} />}
          label="View Device in Customer Context"
          href={`/admin/devices/${device.id}`}
          onClick={closeMenuOnSelect(closeMenu)}
        />
        <DeviceActionButton
          icon={<Copy size={15} />}
          label="Copy Device ID"
          onClick={closeMenuOnSelect(() => {
            closeMenu();
            onCopyDeviceId();
          })}
        />
      </div>
    </DropdownMenu>
  );
}

function DeviceActionButton({
  icon,
  label,
  onClick,
  href,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-primary transition hover:bg-surface-sunken";

  if (href) {
    return (
      <Link
        href={href}
        role="menuitem"
        className={className}
        onClick={onClick}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={className}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function AdminDeviceDrawer({
  loading,
  error,
  device,
  onClose,
  onCopyDeviceId,
}: {
  loading: boolean;
  error: string;
  device: AdminDeviceDetail | null;
  onClose: () => void;
  onCopyDeviceId: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button
        type="button"
        aria-label="Close device details"
        className="absolute inset-0 bg-charcoal/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-device-drawer-title"
        className={cn(
          "relative flex h-full w-full max-w-xl flex-col border-l border-border-subtle bg-surface-card shadow-[var(--shadow-lg)]",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
              Device details
            </p>
            <h2
              id="admin-device-drawer-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary"
            >
              {device?.deviceName || "Device"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-text-secondary transition hover:bg-surface-sunken"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <AdminLoadingState label="Loading device details…" />
          ) : error ? (
            <AdminErrorState message={error} />
          ) : device ? (
            <div className="space-y-4">
              <AdminDetailField
                label="Device name"
                value={displayValue(device.deviceName)}
              />
              <AdminDetailField
                label="Brand"
                value={displayValue(device.brand)}
              />
              <AdminDetailField
                label="Model"
                value={displayValue(device.modelNumber)}
              />
              <AdminDetailField
                label="Category"
                value={displayValue(device.category)}
              />
              <AdminDetailField
                label="Serial number"
                value={displayValue(device.serialNumber)}
              />
              <AdminDetailField
                label="Purchase date"
                value={
                  formatAdminDate(device.purchaseDate) === "—"
                    ? "Not available"
                    : formatAdminDate(device.purchaseDate)
                }
              />
              <AdminDetailField
                label="Purchase price"
                value={
                  device.purchasePrice != null
                    ? `$${device.purchasePrice.toLocaleString()}`
                    : "Not available"
                }
              />
              <AdminDetailField
                label="Warranty expiration"
                value={
                  formatAdminDate(device.warrantyDate) === "—"
                    ? "Not available"
                    : formatAdminDate(device.warrantyDate)
                }
              />
              <AdminDetailField
                label="Location"
                value={displayValue(device.location)}
              />
              <AdminDetailField
                label="Household name"
                value={displayValue(device.householdName)}
              />
              <AdminDetailField
                label="Household owner"
                value={displayValue(
                  device.householdOwnerName ||
                    device.householdOwnerEmail
                )}
              />
              <AdminDetailField
                label="Online status"
                value={getAdminDeviceOnlineLabel(
                  device.onlineStatus
                )}
              />
              <AdminDetailField
                label="Last seen"
                value={
                  formatLastSeen(device.lastSeenAt) ||
                  "Not available"
                }
              />
              <AdminDetailField
                label="IP address"
                value={displayValue(device.ipAddress)}
              />
              <AdminDetailField
                label="MAC address"
                value={displayValue(device.macAddress)}
              />
              <AdminDetailField
                label="Manufacturer"
                value={displayValue(device.manufacturer)}
              />
              <AdminDetailField
                label="Discovery source"
                value={displayValue(device.discoverySource)}
              />
              <AdminDetailField
                label="Documents"
                value={String(device.documentCount)}
              />
              <AdminDetailField
                label="Photos"
                value={String(device.photoCount)}
              />
              <AdminDetailField
                label="Maintenance records"
                value={String(device.maintenanceCount)}
              />
              <AdminDetailField
                label="Created date"
                value={
                  formatAdminDate(device.createdAt) === "—"
                    ? "Not available"
                    : formatAdminDate(device.createdAt)
                }
              />
            </div>
          ) : null}
        </div>

        {device ? (
          <div className="flex flex-wrap gap-3 border-t border-border-subtle px-6 py-5">
            <Button
              href={`/admin/devices/${device.id}`}
              variant="secondary"
            >
              Open read-only page
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCopyDeviceId}
            >
              Copy Device ID
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
