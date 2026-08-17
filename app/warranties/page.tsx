"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarX,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Laptop,
  MapPin,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { getWarrantyDevices } from "@/lib/data/warranties";
import { demoDevices } from "@/lib/demoData";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/design-system/cn";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ViewerBanner } from "@/components/ui/PermissionUI";

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

type WarrantySort =
  | "expiration-soonest"
  | "expiration-latest"
  | "name-asc"
  | "name-desc";

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

    model:
      getString(record, "model") ??
      getString(record, "model_number"),

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

  return "Missing";
}

function getFilterLabel(
  filter: WarrantyFilter
): string {
  if (filter === "all") {
    return "all warranties";
  }

  if (filter === "active") {
    return "active warranties";
  }

  if (filter === "expiring") {
    return "expiring warranties";
  }

  if (filter === "expired") {
    return "expired warranties";
  }

  return "missing warranty information";
}

function getStatusDescription(
  warrantyDate: string | null
): string {
  const status =
    getWarrantyStatus(warrantyDate);

  const daysRemaining =
    getDaysRemaining(warrantyDate);

  if (status === "missing") {
    return "Expiration date not provided";
  }

  if (daysRemaining === null) {
    return "Expiration date not provided";
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

  if (status === "expiring") {
    if (daysRemaining === 1) {
      return "Expires in 1 day";
    }

    return (
      "Expires in " +
      String(daysRemaining) +
      " days"
    );
  }

  if (daysRemaining === 1) {
    return "1 day remaining";
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
        "border-[#617c43]/20 bg-[#617c43]/10 text-[#526b39]",
      icon:
        "bg-[#617c43]/10 text-[#617c43]",
      Icon: ShieldCheck,
    };
  }

  if (status === "expiring") {
    return {
      badge:
        "border-[#b58a42]/20 bg-[#b58a42]/10 text-[#916c31]",
      icon:
        "bg-[#b58a42]/10 text-[#916c31]",
      Icon: Clock3,
    };
  }

  if (status === "expired") {
    return {
      badge:
        "border-[#a6584e]/20 bg-[#a6584e]/10 text-[#984e46]",
      icon:
        "bg-[#a6584e]/10 text-[#984e46]",
      Icon: CircleAlert,
    };
  }

  return {
    badge:
      "border-[#182533]/10 bg-[#182533]/5 text-[#68737b]",
    icon:
      "bg-[#182533]/5 text-[#68737b]",
    Icon: CalendarX,
  };
}

function getWarrantySortValue(
  warrantyDate: string | null
): number | null {
  if (!warrantyDate) {
    return null;
  }

  const expirationDate = new Date(
    warrantyDate + "T12:00:00"
  ).getTime();

  if (Number.isNaN(expirationDate)) {
    return null;
  }

  return expirationDate;
}

export default function WarrantiesPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    householdId,
    role,
    loading: permissionsLoading,
  } = usePermissions();

  const showViewerAccess =
    !permissionsLoading &&
    !isDemo &&
    Boolean(user) &&
    role === "viewer";

  const [devices, setDevices] =
    useState<WarrantyDevice[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<WarrantyFilter>("all");

  const [sortOption, setSortOption] =
    useState<WarrantySort>(
      "expiration-soonest"
    );

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadWarranties = useCallback(
    async () => {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isDemo || !user) {
          const demoWarrantyDevices =
            (demoDevices as unknown[]).map(
              normalizeDevice
            );

          setDevices(
            demoWarrantyDevices
          );

          return;
        }

        const realDevices =
          (
            await getWarrantyDevices(
              user,
              householdId
            )
          ).map(normalizeDevice);

        setDevices(realDevices);
      } catch (loadError: unknown) {
        console.error(
          "Unable to load warranties:",
          loadError
        );

        setError(
          "Unable to load warranty information."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      isDemo,
      householdId,
      permissionsLoading,
    ]
  );

  useEffect(() => {
    let mounted = true;

    async function runLoad() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isDemo || !user) {
          const demoWarrantyDevices =
            (demoDevices as unknown[]).map(
              normalizeDevice
            );

          if (!mounted) {
            return;
          }

          setDevices(
            demoWarrantyDevices
          );

          return;
        }

        const realDevices =
          (
            await getWarrantyDevices(
              user,
              householdId
            )
          ).map(normalizeDevice);

        if (!mounted) {
          return;
        }

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
          "Unable to load warranty information."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void runLoad();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

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

  const protectedValue = useMemo(() => {
    return devices.reduce(
      (total, device) => {
        const status =
          getWarrantyStatus(
            device.warranty_date
          );

        if (
          status === "active" ||
          status === "expiring"
        ) {
          return (
            total +
            (device.purchase_price ?? 0)
          );
        }

        return total;
      },
      0
    );
  }, [devices]);

  const nextExpiringDevice =
    useMemo<WarrantyDevice | null>(() => {
      const eligibleDevices = devices
        .filter((device) => {
          const status =
            getWarrantyStatus(
              device.warranty_date
            );

          return (
            status === "active" ||
            status === "expiring"
          );
        })
        .filter(
          (
            device
          ): device is WarrantyDevice & {
            warranty_date: string;
          } =>
            device.warranty_date !== null
        )
        .sort(
          (
            firstDevice,
            secondDevice
          ) => {
            const firstDate =
              new Date(
                firstDevice.warranty_date +
                  "T12:00:00"
              ).getTime();

            const secondDate =
              new Date(
                secondDevice.warranty_date +
                  "T12:00:00"
              ).getTime();

            return (
              firstDate - secondDate
            );
          }
        );

      return (
        eligibleDevices[0] ?? null
      );
    }, [devices]);

  const filteredDevices =
    useMemo<WarrantyDevice[]>(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      const filtered = devices.filter(
        (device) => {
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
            searchableText.includes(
              search
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );

      return [...filtered].sort(
        (first, second) => {
          const firstName = String(
            first.device_name ?? ""
          ).toLowerCase();
          const secondName = String(
            second.device_name ?? ""
          ).toLowerCase();

          if (sortOption === "name-asc") {
            return firstName.localeCompare(
              secondName
            );
          }

          if (sortOption === "name-desc") {
            return secondName.localeCompare(
              firstName
            );
          }

          const firstDate =
            getWarrantySortValue(
              first.warranty_date
            );
          const secondDate =
            getWarrantySortValue(
              second.warranty_date
            );

          const firstMissing =
            firstDate === null;
          const secondMissing =
            secondDate === null;

          if (
            firstMissing &&
            secondMissing
          ) {
            return firstName.localeCompare(
              secondName
            );
          }

          if (firstMissing) {
            return 1;
          }

          if (secondMissing) {
            return -1;
          }

          if (
            sortOption ===
            "expiration-latest"
          ) {
            return (
              (secondDate ?? 0) -
              (firstDate ?? 0)
            );
          }

          return (
            (firstDate ?? 0) -
            (secondDate ?? 0)
          );
        }
      );
    }, [
      activeFilter,
      devices,
      searchQuery,
      sortOption,
    ]);

  const filtersActive =
    searchQuery.trim() !== "" ||
    activeFilter !== "all" ||
    sortOption !== "expiration-soonest";

  const summaryCards: Array<{
    id: WarrantyFilter;
    title: string;
    value: number;
    description: string;
    icon: typeof ShieldCheck;
    iconClassName: string;
  }> = [
    {
      id: "active",
      title: "Active",
      value: summary.active,
      description: "Coverage currently valid",
      icon: ShieldCheck,
      iconClassName:
        "bg-[#617c43]/10 text-[#617c43]",
    },
    {
      id: "expiring",
      title: "Expiring Soon",
      value: summary.expiring,
      description: "Expires within 90 days",
      icon: Clock3,
      iconClassName:
        "bg-[#b58a42]/10 text-[#916c31]",
    },
    {
      id: "expired",
      title: "Expired",
      value: summary.expired,
      description: "Coverage has ended",
      icon: CircleAlert,
      iconClassName:
        "bg-[#a6584e]/10 text-[#984e46]",
    },
    {
      id: "missing",
      title: "Missing Information",
      value: summary.missing,
      description: "No expiration date saved",
      icon: CalendarX,
      iconClassName:
        "bg-[#182533]/5 text-[#68737b]",
    },
  ];

  const statusFilters: Array<{
    id: WarrantyFilter;
    label: string;
  }> = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "expiring", label: "Expiring" },
    { id: "expired", label: "Expired" },
    { id: "missing", label: "Missing" },
  ];

  const resultsHeader = useMemo(() => {
    const count = filteredDevices.length;
    const search = searchQuery.trim();

    if (search) {
      return (
        "Showing " +
        String(count) +
        " result" +
        (count === 1 ? "" : "s") +
        " for “" +
        search +
        "”"
      );
    }

    if (activeFilter === "expiring") {
      return (
        String(count) +
        " expiring " +
        (count === 1
          ? "warranty"
          : "warranties")
      );
    }

    if (activeFilter === "expired") {
      return (
        String(count) +
        " expired " +
        (count === 1
          ? "warranty"
          : "warranties")
      );
    }

    if (activeFilter === "active") {
      return (
        String(count) +
        " active " +
        (count === 1
          ? "warranty"
          : "warranties")
      );
    }

    if (activeFilter === "missing") {
      return (
        String(count) +
        " device" +
        (count === 1 ? "" : "s") +
        " missing warranty information"
      );
    }

    return (
      String(count) +
      " warranty record" +
      (count === 1 ? "" : "s")
    );
  }, [
    activeFilter,
    filteredDevices.length,
    searchQuery,
  ]);

  function clearFilters() {
    setSearchQuery("");
    setActiveFilter("all");
    setSortOption("expiration-soonest");
  }

  function handleExport() {
    try {
      setExporting(true);
      setError(null);

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

  const pageLoading =
    permissionsLoading || loading;

  return (
    <PageShell>
      <PageHero
        section="homeHealth"
        title="Warranties"
        description="Track coverage, upcoming expirations, and missing warranty information across your household devices."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            href="/devices"
            variant="secondary"
          >
            <Laptop size={17} />
            Devices
          </Button>

          <Button
            type="button"
            onClick={handleExport}
            disabled={
              exporting ||
              pageLoading ||
              filteredDevices.length === 0
            }
            loading={exporting}
            loadingLabel="Exporting..."
          >
            <Download size={17} />
            Export CSV
          </Button>
        </div>
      </PageHero>

      {showViewerAccess ? (
        <ViewerBanner
          description="You can view and search warranty records. Viewer access cannot change device warranty details."
        />
      ) : null}

      {(isDemo || !user) && !pageLoading ? (
        <PageCard className="border-[#b58a42]/20 bg-[#b58a42]/10 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#617c43]/20 bg-[#617c43] text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Demo Mode
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                You are viewing sample warranty
                information from the Morgan Household.
              </p>
            </div>
          </div>
        </PageCard>
      ) : null}

      {error ? (
        <PageCard className="border-[#a6584e]/20 bg-[#a6584e]/10 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-danger-soft text-danger">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  Unable to load warranties
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {error}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void loadWarranties();
              }}
            >
              <RotateCcw size={16} />
              Retry
            </Button>
          </div>
        </PageCard>
      ) : null}

      {pageLoading ? (
        <WarrantiesSkeleton />
      ) : error && devices.length === 0 ? null : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const selected =
                activeFilter === card.id;
              const Icon = card.icon;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      selected
                        ? "all"
                        : card.id
                    )
                  }
                  aria-pressed={selected}
                  className={cn(
                    "htv-focus-ring rounded-[22px] border p-4 text-left shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] transition md:p-5",
                    selected
                      ? "border-[#617c43]/35 bg-[#f8f5ef] ring-2 ring-[#617c43]/10"
                      : "border-[#182533]/10 bg-[#f8f5ef] hover:border-[#617c43]/20 hover:bg-[#f5f1e9]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a858d]">
                        {card.title}
                      </p>
                      <p className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#68737b]">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        card.iconClassName
                      )}
                    >
                      <Icon size={16} aria-hidden />
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a858d]">
                    Protected Value
                  </p>
                  <p className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
                    {formatCurrency(protectedValue)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Covered by active warranties
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </PageCard>

            <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a858d]">
                    Next Expiring
                  </p>
                  {nextExpiringDevice ? (
                    <>
                      <p className="mt-2 truncate font-serif text-lg font-medium text-[#17212a]">
                        {nextExpiringDevice.device_name ??
                          "Unnamed Device"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#916c31]">
                        {getStatusDescription(
                          nextExpiringDevice.warranty_date
                        )}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Expires{" "}
                        {formatDate(
                          nextExpiringDevice.warranty_date
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-lg font-semibold text-text-primary">
                        Nothing upcoming
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        No active warranty expirations found.
                      </p>
                    </>
                  )}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b58a42]/10 text-[#916c31]">
                  <Clock3 size={16} />
                </div>
              </div>
            </PageCard>
          </section>

          <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a949b]"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search devices, brands, models, or locations..."
                    className="htv-focus-ring w-full rounded-xl border border-[#182533]/10 bg-[#eee9df]/60 py-3.5 pl-11 pr-11 text-sm text-[#17212a] outline-none transition placeholder:text-[#8a949b] focus:border-[#617c43]/40 focus:bg-[#f8f5ef] focus:ring-4 focus:ring-[#617c43]/10"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery("")
                      }
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a949b] transition hover:text-[#17212a]"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                <label className="flex min-w-[12rem] items-center gap-2">
                  <span className="sr-only">
                    Sort warranties
                  </span>
                  <SlidersHorizontal
                    size={16}
                    className="shrink-0 text-[#8a949b]"
                    aria-hidden
                  />
                  <select
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(
                        event.target
                          .value as WarrantySort
                      )
                    }
                    className="htv-focus-ring w-full rounded-xl border border-[#182533]/10 bg-[#f8f5ef] px-4 py-3 text-sm text-[#17212a] outline-none transition focus:border-[#617c43]/40"
                  >
                    <option value="expiration-soonest">
                      Expiration Soonest
                    </option>
                    <option value="expiration-latest">
                      Expiration Latest
                    </option>
                    <option value="name-asc">
                      Device Name A–Z
                    </option>
                    <option value="name-desc">
                      Device Name Z–A
                    </option>
                  </select>
                </label>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {statusFilters.map((filter) => {
                  const selected =
                    activeFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() =>
                        setActiveFilter(filter.id)
                      }
                      className={cn(
                        "htv-focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                        selected
                          ? "bg-[#617c43] text-white shadow-sm"
                          : "border border-[#182533]/10 bg-[#f8f5ef] text-[#68737b] hover:border-[#617c43]/25 hover:text-[#17212a]"
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#182533]/10 pt-4">
                <p className="text-sm text-text-secondary">
                  {resultsHeader}
                  {activeFilter !== "all" ? (
                    <span className="text-text-tertiary">
                      {" "}
                      · Filtered by{" "}
                      {getFilterLabel(activeFilter)}
                    </span>
                  ) : null}
                </p>

                {filtersActive ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="htv-focus-ring inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f]"
                  >
                    <X size={15} />
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </PageCard>

          <section className="space-y-3">
            {filteredDevices.length === 0 ? (
              <WarrantyEmptyState
                devicesCount={devices.length}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                onClearSearch={() =>
                  setSearchQuery("")
                }
                onViewAll={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
              />
            ) : (
              <>
                <div className="hidden px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a858d] lg:grid lg:grid-cols-[minmax(0,1.5fr)_7rem_9rem_10rem_9rem_1.5rem] lg:gap-4">
                  <span>Device</span>
                  <span>Location</span>
                  <span>Purchase</span>
                  <span>Expiration</span>
                  <span>Status</span>
                  <span className="sr-only">Open</span>
                </div>

                {filteredDevices.map((device) => (
                  <WarrantyRecord
                    key={device.id}
                    device={device}
                    onOpen={() =>
                      router.push(
                        "/devices/" + device.id
                      )
                    }
                  />
                ))}
              </>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}

function WarrantyRecord({
  device,
  onOpen,
}: {
  device: WarrantyDevice;
  onOpen: () => void;
}) {
  const status = getWarrantyStatus(
    device.warranty_date
  );
  const styles = getStatusStyles(status);
  const StatusIcon = styles.Icon;
  const brandModel =
    [device.brand, device.model]
      .filter(Boolean)
      .join(" · ") || "Brand and model not added";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="htv-focus-ring group w-full rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-4 text-left shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] transition hover:-translate-y-0.5 hover:border-[#617c43]/25 hover:shadow-[0_24px_50px_-34px_rgba(15,25,35,0.55)] md:p-5"
    >
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-medium tracking-[-0.03em] text-[#17212a]">
              {device.device_name ?? "Unnamed Device"}
            </h3>
            <p className="mt-1 text-sm text-[#68737b]">
              {brandModel}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
              styles.badge
            )}
          >
            <StatusIcon size={13} aria-hidden />
            {getStatusLabel(status)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-[#68737b]">
          <p className="font-medium text-text-primary">
            {status === "missing"
              ? "Warranty date missing"
              : formatDate(device.warranty_date)}
          </p>
          <p className="text-text-secondary">
            {status === "missing"
              ? "Add warranty details from the device page"
              : getStatusDescription(
                  device.warranty_date
                )}
          </p>
          {device.location ? (
            <p className="inline-flex items-center gap-1.5 text-text-secondary">
              <MapPin size={14} aria-hidden />
              {device.location}
            </p>
          ) : null}
          {(device.purchase_date ||
            device.purchase_price !== null) && (
            <p className="text-text-secondary">
              {[
                device.purchase_date
                  ? "Purchased " +
                    formatDate(device.purchase_date)
                  : null,
                device.purchase_price !== null
                  ? formatCurrency(
                      device.purchase_price
                    )
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#182533]/8 pt-3 text-sm font-semibold text-[#617c43]">
          View Device
          <ChevronRight
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.5fr)_7rem_9rem_10rem_9rem_1.5rem] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                styles.icon
              )}
            >
              <Laptop size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-serif text-base font-medium text-[#17212a]">
                {device.device_name ?? "Unnamed Device"}
              </h3>
              <p className="mt-1 truncate text-sm text-text-secondary">
                {brandModel}
              </p>
            </div>
          </div>
        </div>

        <p className="truncate text-sm text-text-secondary">
          {device.location ?? "—"}
        </p>

        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-text-primary">
            {device.purchase_price !== null
              ? formatCurrency(device.purchase_price)
              : "—"}
          </p>
          <p className="mt-1 truncate text-text-tertiary">
            {device.purchase_date
              ? formatDate(device.purchase_date)
              : "No purchase date"}
          </p>
        </div>

        <div className="min-w-0 text-sm">
          {status === "missing" ? (
            <>
              <p className="font-medium text-text-primary">
                Warranty date missing
              </p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                Add details on the device page
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-text-primary">
                {formatDate(device.warranty_date)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {getStatusDescription(
                  device.warranty_date
                )}
              </p>
            </>
          )}
        </div>

        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
            styles.badge
          )}
        >
          <StatusIcon size={13} aria-hidden />
          {getStatusLabel(status)}
        </span>

        <ChevronRight
          size={18}
          className="justify-self-end text-[#8a949b] transition group-hover:translate-x-0.5 group-hover:text-[#617c43]"
        />
      </div>
    </button>
  );
}

function WarrantyEmptyState({
  devicesCount,
  activeFilter,
  searchQuery,
  onClearSearch,
  onViewAll,
}: {
  devicesCount: number;
  activeFilter: WarrantyFilter;
  searchQuery: string;
  onClearSearch: () => void;
  onViewAll: () => void;
}) {
  if (devicesCount === 0) {
    return (
      <EmptyState
        icon={Laptop}
        title="No devices have been added yet."
        description="Add devices to start tracking warranty coverage and expiration dates."
        section="homeHealth"
        actionLabel="Go to Devices"
        actionHref="/devices"
      />
    );
  }

  if (searchQuery.trim()) {
    return (
      <EmptyState
        icon={Search}
        title="No warranties match your search."
        description="Try another device name, brand, model, or location."
        section="homeHealth"
      >
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={onClearSearch}
        >
          Clear Search
        </Button>
      </EmptyState>
    );
  }

  let title = "No warranties found.";
  let description =
    "Try another filter to review coverage across your devices.";

  if (activeFilter === "expiring") {
    title = "No warranties are expiring soon.";
    description =
      "None of your devices expire within the next 90 days.";
  } else if (activeFilter === "expired") {
    title = "No expired warranties found.";
    description =
      "Great news — nothing in this list has ended coverage.";
  } else if (activeFilter === "missing") {
    title = "All devices have warranty information.";
    description =
      "Every device currently has an expiration date on file.";
  } else if (activeFilter === "active") {
    title = "No active warranties found.";
    description =
      "Try viewing all warranties or check devices that may be missing dates.";
  }

  return (
    <EmptyState
      icon={ShieldCheck}
      title={title}
      description={description}
      section="homeHealth"
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-6"
        onClick={onViewAll}
      >
        View All Warranties
      </Button>
    </EmptyState>
  );
}

function WarrantiesSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef]"
          />
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="h-24 animate-pulse rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef]" />
        <div className="h-24 animate-pulse rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef]" />
      </section>

      <div className="h-40 animate-pulse rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef]" />

      <section className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef]"
          />
        ))}
      </section>
    </div>
  );
}
