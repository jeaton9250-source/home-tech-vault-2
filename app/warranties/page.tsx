"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import { useDemoMode } from "@/hooks/useDemoMode";
import { getWarrantyDevices } from "@/lib/data/warranties";

type WarrantyGroup =
  | "all"
  | "active"
  | "expiring"
  | "expired"
  | "missing";

type WarrantyDevice = {
  id: string;
  device_name?: string | null;
  brand?: string | null;
  location?: string | null;
  warranty_date?: string | null;
  purchase_price?: number | null;
};

type WarrantyStatus = {
  label: string;
  group: Exclude<WarrantyGroup, "all">;
  badgeClass: string;
  days: number | null;
};

type WarrantyIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

function getWarrantyStatus(
  warrantyDate?: string | null
): WarrantyStatus {
  if (!warrantyDate) {
    return {
      label: "Warranty missing",
      group: "missing",
      badgeClass:
        "bg-neutral-100 text-neutral-600",
      days: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const warranty = new Date(
    `${warrantyDate}T23:59:59`
  );

  if (
    Number.isNaN(
      warranty.getTime()
    )
  ) {
    return {
      label: "Warranty unknown",
      group: "missing",
      badgeClass:
        "bg-neutral-100 text-neutral-600",
      days: null,
    };
  }

  const diffDays = Math.ceil(
    (warranty.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      label: `Expired ${Math.abs(
        diffDays
      )} days ago`,
      group: "expired",
      badgeClass:
        "bg-red-50 text-red-700",
      days: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Expires today",
      group: "expiring",
      badgeClass:
        "bg-amber-50 text-amber-700",
      days: diffDays,
    };
  }

  if (diffDays <= 30) {
    return {
      label: `${diffDays} days left`,
      group: "expiring",
      badgeClass:
        "bg-amber-50 text-amber-700",
      days: diffDays,
    };
  }

  return {
    label: "Warranty active",
    group: "active",
    badgeClass:
      "bg-emerald-50 text-emerald-700",
    days: diffDays,
  };
}

export default function WarrantiesPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [devices, setDevices] =
    useState<WarrantyDevice[]>([]);

  const [
    loadingDevices,
    setLoadingDevices,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<WarrantyGroup>("all");

  useEffect(() => {
    async function loadDevices() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        const data =
          await getWarrantyDevices(
            user
          );

        setDevices(data || []);
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Warranty loading error:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load warranty information."
        );
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, [
    user,
    demoLoading,
  ]);

  const groupedDevices =
    useMemo(() => {
      return {
        active: devices.filter(
          (device) =>
            getWarrantyStatus(
              device.warranty_date
            ).group === "active"
        ),

        expiring: devices.filter(
          (device) =>
            getWarrantyStatus(
              device.warranty_date
            ).group === "expiring"
        ),

        expired: devices.filter(
          (device) =>
            getWarrantyStatus(
              device.warranty_date
            ).group === "expired"
        ),

        missing: devices.filter(
          (device) =>
            getWarrantyStatus(
              device.warranty_date
            ).group === "missing"
        ),
      };
    }, [devices]);

  const filteredDevices =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return devices
        .filter((device) => {
          const status =
            getWarrantyStatus(
              device.warranty_date
            );

          const matchesStatus =
            selectedStatus ===
              "all" ||
            status.group ===
              selectedStatus;

          const searchableText = [
            device.device_name,
            device.brand,
            device.location,
            status.label,
          ]
            .map((value) =>
              String(
                value || ""
              ).toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            query === "" ||
            searchableText.includes(
              query
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        })
        .sort(
          (first, second) => {
            const firstStatus =
              getWarrantyStatus(
                first.warranty_date
              );

            const secondStatus =
              getWarrantyStatus(
                second.warranty_date
              );

            return (
              getWarrantySortValue(
                firstStatus
              ) -
              getWarrantySortValue(
                secondStatus
              )
            );
          }
        );
    }, [
      devices,
      searchTerm,
      selectedStatus,
    ]);

  const coveredDeviceCount =
    groupedDevices.active.length +
    groupedDevices.expiring.length;

  const coverageRate =
    devices.length === 0
      ? 0
      : Math.round(
          (coveredDeviceCount /
            devices.length) *
            100
        );

  const loading =
    demoLoading ||
    loadingDevices;

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedStatus !== "all";

  function clearFilters() {
    setSearchTerm("");
    setSelectedStatus("all");
  }

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading warranties...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load warranties
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Coverage
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your warranties.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Track active coverage,
              upcoming expirations,
              expired plans, and missing
              warranty information.
            </p>
          </div>

          <Button
            href={
              isDemo
                ? "/signup"
                : "/devices/add"
            }
            variant="secondary"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : "Add Device"}
          </Button>
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Explore how Home Tech Vault
            tracks coverage and upcoming
            warranty deadlines.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={ShieldCheck}
          label="Active"
          value={groupedDevices.active.length}
          description="Coverage in good standing"
          tone="green"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Expiring Soon"
          value={
            groupedDevices.expiring.length
          }
          description="Within the next 30 days"
          tone="gold"
        />

        <SummaryCard
          icon={ShieldAlert}
          label="Expired"
          value={
            groupedDevices.expired.length
          }
          description="Coverage has ended"
          tone="red"
        />

        <SummaryCard
          icon={HelpCircle}
          label="Missing"
          value={
            groupedDevices.missing.length
          }
          description="No warranty date saved"
          tone="neutral"
        />
      </section>

      {devices.length > 0 && (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <PageCard className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Warranty Coverage
            </p>

            <div className="mt-7">
              <CoverageRing
                score={coverageRate}
              />
            </div>

            <p className="mt-7 max-w-sm text-sm leading-6 text-neutral-500">
              {coveredDeviceCount} of{" "}
              {devices.length} devices
              currently have active or
              expiring coverage.
            </p>
          </PageCard>

          <PageCard className="p-7 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Warranty Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              What needs attention
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Review devices that have
              upcoming deadlines or
              incomplete warranty records.
            </p>

            <div className="mt-7 space-y-3">
              <AttentionRow
                icon={AlertTriangle}
                label="Expiring within 30 days"
                value={
                  groupedDevices.expiring.length
                }
                tone="gold"
              />

              <AttentionRow
                icon={ShieldAlert}
                label="Expired warranties"
                value={
                  groupedDevices.expired.length
                }
                tone="red"
              />

              <AttentionRow
                icon={HelpCircle}
                label="Missing warranty dates"
                value={
                  groupedDevices.missing.length
                }
                tone="neutral"
              />
            </div>

            <Button
              href="/devices"
              variant="secondary"
              className="mt-6"
            >
              View All Devices
            </Button>
          </PageCard>
        </section>
      )}

      {devices.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search devices, brands, or rooms..."
                className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:bg-white focus:ring-4 focus:ring-[#C8A96A]/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-[#111827]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  {
                    value: "all",
                    label: "All Warranties",
                  },
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "expiring",
                    label:
                      "Expiring Soon",
                  },
                  {
                    value: "expired",
                    label: "Expired",
                  },
                  {
                    value: "missing",
                    label: "Missing",
                  },
                ] as {
                  value: WarrantyGroup;
                  label: string;
                }[]
              ).map((status) => {
                const active =
                  selectedStatus ===
                  status.value;

                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() =>
                      setSelectedStatus(
                        status.value
                      )
                    }
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[#111827] text-white"
                        : "border border-[#E8E2D6] bg-white text-neutral-500 hover:border-[#C8A96A] hover:text-[#111827]"
                    }`}
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D6] pt-4">
              <p className="text-sm text-neutral-500">
                {filteredDevices.length}{" "}
                {filteredDevices.length ===
                1
                  ? "warranty"
                  : "warranties"}
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition hover:text-[#8A6A2F]"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </PageCard>
      )}

      {devices.length === 0 ? (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <ShieldCheck size={29} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No warranty records yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Add a device with a warranty
            expiration date to begin
            tracking its coverage.
          </p>

          <Button
            href={
              isDemo
                ? "/signup"
                : "/devices/add"
            }
            className="mt-6"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : "Add Your First Device"}
          </Button>
        </PageCard>
      ) : filteredDevices.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map(
            (device) => (
              <WarrantyCard
                key={device.id}
                device={device}
                isDemo={isDemo}
              />
            )
          )}
        </section>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching warranties
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try changing your search
            or warranty status.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}

function WarrantyCard({
  device,
  isDemo,
}: {
  device: WarrantyDevice;
  isDemo: boolean;
}) {
  const warranty =
    getWarrantyStatus(
      device.warranty_date
    );

  const content = (
    <article className="group h-full overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8C69D] hover:shadow-lg">
      <div className="bg-[#F7F5EF] px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-[22px] bg-white shadow-sm ${
              warranty.group ===
              "active"
                ? "text-emerald-700"
                : warranty.group ===
                    "expiring"
                  ? "text-amber-700"
                  : warranty.group ===
                      "expired"
                    ? "text-red-700"
                    : "text-[#8A6A2F]"
            }`}
          >
            {getStatusIcon(
              warranty.group
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${warranty.badgeClass}`}
          >
            {warranty.label}
          </span>
        </div>

        <h2 className="mt-7 text-2xl font-semibold tracking-[-0.04em] text-[#111827]">
          {device.device_name ||
            "Unnamed Device"}
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          {[
            device.brand,
            device.location,
          ]
            .filter(Boolean)
            .join(" · ") ||
            "Device details"}
        </p>
      </div>

      <div className="p-6">
        <div className="rounded-[22px] bg-[#F7F5EF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Warranty Expiration
          </p>

          <p className="mt-2 font-semibold text-[#111827]">
            {formatWarrantyDate(
              device.warranty_date
            )}
          </p>
        </div>

        <div className="mt-5 border-t border-[#E8E2D6] pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-400">
                Coverage Status
              </p>

              <p className="mt-1 font-semibold text-[#111827]">
                {getShortStatus(
                  warranty
                )}
              </p>
            </div>

            {!isDemo && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A2F]">
                View Device
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  if (isDemo) {
    return content;
  }

  return (
    <Link
      href={`/devices/${device.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: WarrantyIcon;
  label: string;
  value: number;
  description: string;
  tone:
    | "green"
    | "gold"
    | "red"
    | "neutral";
}) {
  const toneClasses = {
    green:
      "bg-emerald-50 text-emerald-700",
    gold:
      "bg-[#FFF8E8] text-[#8A6A2F]",
    red:
      "bg-red-50 text-red-700",
    neutral:
      "bg-neutral-100 text-neutral-600",
  };

  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function AttentionRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: WarrantyIcon;
  label: string;
  value: number;
  tone:
    | "gold"
    | "red"
    | "neutral";
}) {
  const toneClasses = {
    gold:
      "bg-amber-50 text-amber-700",
    red:
      "bg-red-50 text-red-700",
    neutral:
      "bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-[22px] bg-[#F7F5EF] p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        <Icon size={18} />
      </div>

      <p className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">
        {label}
      </p>

      <span className="text-xl font-semibold text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function CoverageRing({
  score,
}: {
  score: number;
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(score, 100)
  );

  const radius = 72;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (normalizedScore / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox="0 0 176 176"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Warranty coverage: ${normalizedScore}%`}
      >
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#E8E2D6"
          strokeWidth="12"
        />

        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-[#111827]">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-neutral-400">
            %
          </span>
        </span>

        <span className="mt-2 text-sm font-semibold text-[#8A6A2F]">
          Covered
        </span>
      </div>
    </div>
  );
}

function getWarrantySortValue(
  status: WarrantyStatus
) {
  if (
    status.group ===
    "expiring"
  ) {
    return (
      status.days ?? 0
    );
  }

  if (
    status.group === "active"
  ) {
    return (
      1000 +
      (status.days ?? 0)
    );
  }

  if (
    status.group === "expired"
  ) {
    return 100000;
  }

  return 200000;
}

function getStatusIcon(
  group: Exclude<
    WarrantyGroup,
    "all"
  >
) {
  if (group === "active") {
    return (
      <ShieldCheck size={25} />
    );
  }

  if (
    group === "expiring"
  ) {
    return (
      <CalendarClock size={25} />
    );
  }

  if (
    group === "expired"
  ) {
    return (
      <ShieldAlert size={25} />
    );
  }

  return (
    <HelpCircle size={25} />
  );
}

function getShortStatus(
  warranty: WarrantyStatus
) {
  if (
    warranty.group === "active" &&
    warranty.days !== null
  ) {
    return `${warranty.days} days remaining`;
  }

  if (
    warranty.group ===
      "expiring" &&
    warranty.days !== null
  ) {
    return warranty.days === 0
      ? "Expires today"
      : `${warranty.days} days remaining`;
  }

  if (
    warranty.group ===
    "expired"
  ) {
    return "Coverage expired";
  }

  return "Not recorded";
}

function formatWarrantyDate(
  value?: string | null
) {
  if (!value) {
    return "Not added";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}