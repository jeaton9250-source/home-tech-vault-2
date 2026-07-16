"use client";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Laptop,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { demoDevices } from "@/lib/demoData";
type WarrantyFilter =
  | "all"
  | "active"
  | "expiring"
  | "expired"
  | "missing";
type WarrantyStatus =
  | "active"
  | "expiring"
  | "expired"
  | "missing";
type WarrantyDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  warranty_date: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
};
type WarrantySummary = {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  missing: number;
};
type UnknownRecord = Record<string, unknown>;
function getString(
  record: UnknownRecord,
  key: string
): string | null {
  const value = record[key];
  return typeof value === "string"
    ? value
    : null;
}
function getNumber(
  record: UnknownRecord,
  key: string
): number | null {
  const value = record[key];
  return typeof value === "number"
    ? value
    : null;
}
function normalizeDevice(
  device: unknown,
  index: number
): WarrantyDevice {
  const record: UnknownRecord =
    typeof device === "object" &&
    device !== null
      ? (device as UnknownRecord)
      : {};
  return {
    id:
      getString(record, "id") ??
      "demo-device-" + String(index + 1),
    device_name:
      getString(record, "device_name") ??
      "Unnamed Device",
    brand: getString(record, "brand"),
    model: getString(record, "model"),
    location: getString(
      record,
      "location"
    ),
    warranty_date: getString(
      record,
      "warranty_date"
    ),
    purchase_date: getString(
      record,
      "purchase_date"
    ),
    purchase_price: getNumber(
      record,
      "purchase_price"
    ),
  };
}
function getWarrantyStatus(
  warrantyDate: string | null
): WarrantyStatus {
  if (!warrantyDate) {
    return "missing";
  }
  const expirationDate = new Date(
    warrantyDate + "T12:00:00"
  );
  if (
    Number.isNaN(
      expirationDate.getTime()
    )
  ) {
    return "missing";
  }
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil(
    (expirationDate.getTime() -
      Date.now()) /
      millisecondsPerDay
  );
  if (daysRemaining < 0) {
    return "expired";
  }
  if (daysRemaining <= 90) {
    return "expiring";
  }
  return "active";
}
function getDaysRemaining(
  warrantyDate: string | null
): number | null {
  if (!warrantyDate) {
    return null;
  }
  const expirationDate = new Date(
    warrantyDate + "T12:00:00"
  );
  if (
    Number.isNaN(
      expirationDate.getTime()
    )
  ) {
    return null;
  }
  const millisecondsPerDay =
    1000 * 60 * 60 * 24;
  return Math.ceil(
    (expirationDate.getTime() -
      Date.now()) /
      millisecondsPerDay
  );
}
function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not added";
  }
  const date = new Date(
    value + "T12:00:00"
  );
  if (Number.isNaN(date.getTime())) {
    return "Not added";
  }
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}
function formatCurrency(
  value: number | null
): string {
  if (value === null) {
    return "Not added";
  }
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value);
}
function getStatusLabel(
  status: WarrantyStatus
): string {
  if (status === "active") {
    return "Active";
  }
  if (status === "expiring") {
    return "Expiring Soon";
  }
  if (status === "expired") {
    return "Expired";
  }
  return "Missing Warranty";
}
function getStatusDescription(
  warrantyDate: string | null
): string {
  const status =
    getWarrantyStatus(warrantyDate);
  const daysRemaining =
    getDaysRemaining(warrantyDate);
  if (status === "missing") {
    return "Add a warranty expiration date.";
  }
  if (daysRemaining === null) {
    return "";
  }
  if (status === "expired") {
    const expiredDays =
      Math.abs(daysRemaining);
    if (expiredDays === 1) {
      return "Expired 1 day ago";
    }
    return (
      "Expired " +
      String(expiredDays) +
      " days ago"
    );
  }
  if (daysRemaining === 0) {
    return "Expires today";
  }
  return (
    String(daysRemaining) +
    " days remaining"
  );
}
function getStatusStyles(
  status: WarrantyStatus
) {
  if (status === "active") {
    return {
      badge:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon:
        "bg-emerald-100 text-emerald-700",
    };
  }
  if (status === "expiring") {
    return {
      badge:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon:
        "bg-amber-100 text-amber-700",
    };
  }
  if (status === "expired") {
    return {
      badge:
        "border-red-200 bg-red-50 text-red-700",
      icon:
        "bg-red-100 text-red-700",
    };
  }
  return {
    badge:
      "border-neutral-200 bg-neutral-100 text-neutral-600",
    icon:
      "bg-neutral-100 text-neutral-600",
  };
}
export default function WarrantiesPage() {
  const router = useRouter();
  const [user, setUser] =
    useState<User | null>(null);
  const [devices, setDevices] =
    useState<WarrantyDevice[]>([]);
  const [searchQuery, setSearchQuery] =
    useState("");
  const [activeFilter, setActiveFilter] =
    useState<WarrantyFilter>("all");
  const [loading, setLoading] =
    useState(true);
  const [exporting, setExporting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function loadWarranties() {
      try {
        setLoading(true);
        setError(null);
        const authResult =
          await supabase.auth.getUser();
        const currentUser =
          authResult.data.user;
        if (authResult.error) {
          throw authResult.error;
        }
        if (!mounted) {
          return;
        }
        setUser(currentUser);
        if (!currentUser) {
          const demoWarrantyDevices =
            (demoDevices as unknown[]).map(
              normalizeDevice
            );
          setDevices(
            demoWarrantyDevices
          );
          return;
        }
        const queryResult =
          await supabase
            .from("devices")
            .select(
              "id, device_name, brand, model, location, warranty_date, purchase_date, purchase_price"
            )
            .order("device_name", {
              ascending: true,
            });
        if (queryResult.error) {
          throw queryResult.error;
        }
        if (!mounted) {
          return;
        }
        const realDevices =
          (
            (queryResult.data ??
              []) as unknown[]
          ).map(normalizeDevice);
        setDevices(realDevices);
      } catch (loadError: unknown) {
        console.error(
          "Unable to load warranties:",
          loadError
        );
        if (!mounted) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load warranty information."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    void loadWarranties();
    return () => {
      mounted = false;
    };
  }, []);
  const summary =
    useMemo<WarrantySummary>(() => {
      return devices.reduce(
        (result, device) => {
          const status =
            getWarrantyStatus(
              device.warranty_date
            );
          result.total += 1;
          result[status] += 1;
          return result;
        },
        {
          total: 0,
          active: 0,
          expiring: 0,
          expired: 0,
          missing: 0,
        }
      );
    }, [devices]);
  const filteredDevices =
    useMemo<WarrantyDevice[]>(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();
      return devices.filter((device) => {
        const status =
          getWarrantyStatus(
            device.warranty_date
          );
        const matchesFilter =
          activeFilter === "all" ||
          status === activeFilter;
        const searchableText = [
          device.device_name,
          device.brand,
          device.model,
          device.location,
        ]
          .filter(
            (value): value is string =>
              typeof value === "string"
          )
          .join(" ")
          .toLowerCase();
        const matchesSearch =
          search.length === 0 ||
          searchableText.includes(search);
        return (
          matchesFilter &&
          matchesSearch
        );
      });
    }, [
      activeFilter,
      devices,
      searchQuery,
    ]);
  const filters: Array<{
    id: WarrantyFilter;
    label: string;
    count: number;
  }> = [
    {
      id: "all",
      label: "All",
      count: summary.total,
    },
    {
      id: "active",
      label: "Active",
      count: summary.active,
    },
    {
      id: "expiring",
      label: "Expiring Soon",
      count: summary.expiring,
    },
    {
      id: "expired",
      label: "Expired",
      count: summary.expired,
    },
    {
      id: "missing",
      label: "Missing",
      count: summary.missing,
    },
  ];
  function handleExport() {
    try {
      setExporting(true);
      const rows: string[][] = [
        [
          "Device",
          "Brand",
          "Model",
          "Location",
          "Purchase Date",
          "Purchase Price",
          "Warranty Expiration",
          "Warranty Status",
        ],
        ...filteredDevices.map(
          (device) => [
            device.device_name ??
              "Unnamed Device",
            device.brand ?? "",
            device.model ?? "",
            device.location ?? "",
            device.purchase_date ?? "",
            device.purchase_price === null
              ? ""
              : String(
                  device.purchase_price
                ),
            device.warranty_date ?? "",
            getStatusLabel(
              getWarrantyStatus(
                device.warranty_date
              )
            ),
          ]
        ),
      ];
      const csv = rows
        .map((row) =>
          row
            .map((value) => {
              const escaped =
                value.replace(
                  /"/g,
                  '""'
                );
              return (
                '"' +
                escaped +
                '"'
              );
            })
            .join(",")
        )
        .join("\n");
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
      });
      const url =
        URL.createObjectURL(blob);
      const anchor =
        document.createElement("a");
      anchor.href = url;
      anchor.download =
        "home-tech-vault-warranties.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error(
        "Unable to export warranties:",
        exportError
      );
      setError(
        "Unable to export warranties."
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
                Warranties
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Track warranty coverage and
                see which devices need
                attention.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={
              exporting ||
              filteredDevices.length === 0
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 disabled:opacity-50"
          >
            <Download size={17} />
            {exporting
              ? "Exporting..."
              : "Export"}
          </button>
        </header>
        {!loading && !user && (
          <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900">
            <CircleAlert size={20} />
            <div>
              <p className="font-semibold">
                Demo Mode
              </p>
              <p className="mt-1 text-sm">
                You are viewing sample
                warranty information.
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
            <ShieldAlert size={20} />
            <div>
              <p className="font-semibold">
                Unable to load warranties
              </p>
              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Active"
            value={summary.active}
            description="Protected devices"
            icon={
              <CheckCircle2 size={22} />
            }
            iconClassName="bg-emerald-100 text-emerald-700"
          />
          <SummaryCard
            title="Expiring Soon"
            value={summary.expiring}
            description="Within 90 days"
            icon={
              <CalendarClock size={22} />
            }
            iconClassName="bg-amber-100 text-amber-700"
          />
          <SummaryCard
            title="Expired"
            value={summary.expired}
            description="Coverage ended"
            icon={
              <ShieldAlert size={22} />
            }
            iconClassName="bg-red-100 text-red-700"
          />
          <SummaryCard
            title="Missing"
            value={summary.missing}
            description="Need warranty dates"
            icon={<Clock3 size={22} />}
            iconClassName="bg-neutral-100 text-neutral-600"
          />
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Warranty Overview
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Search and filter your
                devices.
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search devices..."
                className="h-11 w-full rounded-xl border border-neutral-200 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter.id
                  )
                }
                className={
                  activeFilter === filter.id
                    ? "shrink-0 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
                    : "shrink-0 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600"
                }
              >
                {filter.label +
                  " (" +
                  String(filter.count) +
                  ")"}
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          {loading ? (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white"
              />
            ))
          ) : filteredDevices.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
              <ShieldCheck
                size={30}
                className="mx-auto text-neutral-400"
              />
              <h2 className="mt-4 font-semibold">
                No warranties found
              </h2>
            </div>
          ) : (
            filteredDevices.map(
              (device) => {
                const status =
                  getWarrantyStatus(
                    device.warranty_date
                  );
                const styles =
                  getStatusStyles(status);
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() =>
                      router.push(
                        "/devices/" +
                          device.id
                      )
                    }
                    className="w-full rounded-3xl border border-neutral-200 bg-white p-5 text-left shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div
                          className={
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl " +
                            styles.icon
                          }
                        >
                          <Laptop size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-neutral-950">
                              {device.device_name ??
                                "Unnamed Device"}
                            </h3>
                            <span
                              className={
                                "rounded-full border px-2.5 py-1 text-xs font-semibold " +
                                styles.badge
                              }
                            >
                              {getStatusLabel(
                                status
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-500">
                            {[
                              device.brand,
                              device.model,
                            ]
                              .filter(Boolean)
                              .join(" • ") ||
                              "Brand and model not added"}
                          </p>
                          <p className="mt-2 text-sm font-medium">
                            {getStatusDescription(
                              device.warranty_date
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="grid flex-1 gap-3 sm:grid-cols-3">
                        <DetailBox
                          label="Warranty Ends"
                          value={formatDate(
                            device.warranty_date
                          )}
                        />
                        <DetailBox
                          label="Purchase Price"
                          value={formatCurrency(
                            device.purchase_price
                          )}
                        />
                        <DetailBox
                          label="Location"
                          value={
                            device.location ??
                            "Not added"
                          }
                        />
                      </div>
                      <ChevronRight
                        size={20}
                        className="hidden text-neutral-400 lg:block"
                      />
                    </div>
                  </button>
                );
              }
            )
          )}
        </section>
      </div>
    </main>
  );
}
function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {description}
          </p>
        </div>
        <div
          className={
            "flex h-11 w-11 items-center justify-center rounded-2xl " +
            iconClassName
          }
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}