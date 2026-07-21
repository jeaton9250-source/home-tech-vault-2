"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Laptop,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";

import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import type {
  Device as BaseDevice,
} from "@/lib/calculateTechnologyScore";
import { demoDevices } from "@/lib/demoData";
import { withDemoDevicePhoto } from "@/lib/devices/getDeviceImage";

import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  ViewerBanner,
} from "@/components/ui/PermissionUI";

type DeviceRecord = BaseDevice & {
  id: string;
  user_id?: string;
  household_id?: string | null;
  device_name: string;
  photo_url?: string;
  demo_image?: string;
};

type DeviceImageRecord = {
  device_id: string;
  image_url: string;
};

type SortOption =
  | "name"
  | "value-high"
  | "value-low"
  | "warranty-soon";

export default function DevicesPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const {
    user,
    isDemo,
    householdId,
    canCreate,
    deviceLimit,
    hasUnlimitedDevices,
    loading: permissionsLoading,
  } = usePermissions();

  const [devices, setDevices] =
    useState<DeviceRecord[]>([]);

  const [
    loadingDevices,
    setLoadingDevices,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("name");

  const [showFilters, setShowFilters] =
    useState(false);

  useEffect(() => {
    const searchFromUrl =
      searchParams.get("search") ?? "";

    setSearchTerm(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        /*
         * Signed-out visitors use sample data.
         * Signed-in viewers still load their
         * real shared household devices.
         */
        if (isDemo || !user) {
          const sampleDevices: DeviceRecord[] =
            demoDevices.map(
              (device) =>
                withDemoDevicePhoto({
                  id: device.id,
                  device_name:
                    device.device_name,
                  brand: device.brand,
                  category:
                    device.category,
                  model_number:
                    device.model_number,
                  serial_number:
                    device.serial_number,
                  purchase_date:
                    device.purchase_date,
                  warranty_date:
                    device.warranty_date,
                  purchase_price:
                    device.purchase_price,
                  location:
                    device.location,
                  notes: device.notes,
                  online: device.online,
                  last_seen_at:
                    device.last_seen_at,
                  ip_address:
                    device.ip_address,
                  demo_image:
                    device.demo_image,
                  photo_url:
                    device.photo_url ?? "",
                })
            );

          if (!mounted) {
            return;
          }

          setDevices(sampleDevices);

          return;
        }

        const deviceQuery =
          applyHouseholdScope(
            supabase
              .from("devices")
              .select("*"),
            householdId,
            user.id
          );

        const {
          data: deviceData,
          error: deviceError,
        } = await deviceQuery;

        if (deviceError) {
          throw deviceError;
        }

        if (!mounted) {
          return;
        }

        const loadedDevices =
          (deviceData ??
            []) as DeviceRecord[];

        if (
          loadedDevices.length === 0
        ) {
          setDevices([]);
          return;
        }

        const deviceIds =
          loadedDevices.map(
            (device) => device.id
          );

        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from("device_images")
          .select(
            "device_id, image_url"
          )
          .in(
            "device_id",
            deviceIds
          );

        if (imageError) {
          console.error(
            "Unable to load device images:",
            imageError
          );

          if (!mounted) {
            return;
          }

          setDevices(
            loadedDevices.map(
              (device) => ({
                ...device,
                photo_url:
                  device.photo_url ?? "",
              })
            )
          );

          return;
        }

        const firstImageByDevice =
          new Map<string, string>();

        for (
          const image of
          (imageData ??
            []) as DeviceImageRecord[]
        ) {
          if (
            !firstImageByDevice.has(
              image.device_id
            )
          ) {
            firstImageByDevice.set(
              image.device_id,
              image.image_url
            );
          }
        }

        const devicesWithPhotos =
          await Promise.all(
            loadedDevices.map(
              async (device) => {
                const imagePath =
                  firstImageByDevice.get(
                    device.id
                  );

                if (!imagePath) {
                  return {
                    ...device,
                    photo_url:
                      device.photo_url ??
                      "",
                  };
                }

                const {
                  data: signedData,
                  error: signedError,
                } =
                  await supabase.storage
                    .from(
                      "device-images"
                    )
                    .createSignedUrl(
                      imagePath,
                      3600
                    );

                if (signedError) {
                  console.error(
                    "Unable to create photo URL for " +
                      device.device_name +
                      ":",
                    signedError
                  );
                }

                return {
                  ...device,
                  photo_url:
                    signedData
                      ?.signedUrl ??
                    device.photo_url ??
                    "",
                };
              }
            )
          );

        if (!mounted) {
          return;
        }

        setDevices(
          devicesWithPhotos
        );
      } catch (error: unknown) {
        console.error(
          "Unable to load devices:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your devices."
        );
      } finally {
        if (mounted) {
          setLoadingDevices(false);
        }
      }
    }

    void loadDevices();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  const categories = useMemo(() => {
    const values = devices
      .map((device) =>
        device.category?.trim()
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [devices]);

  const locations = useMemo(() => {
    const values = devices
      .map((device) =>
        device.location?.trim()
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [devices]);

  const filteredDevices =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .toLowerCase()
          .trim();

      const results =
        devices.filter((device) => {
          const searchableText = [
            device.device_name,
            device.brand,
            device.category,
            device.model_number,
            device.serial_number,
            device.location,
            device.notes,
          ]
            .map((value) =>
              String(value ?? "")
                .toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            normalizedSearch === "" ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesCategory =
            selectedCategory === "All" ||
            String(
              device.category ?? ""
            ).trim() ===
              selectedCategory;

          const matchesLocation =
            selectedLocation === "All" ||
            String(
              device.location ?? ""
            ).trim() ===
              selectedLocation;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesLocation
          );
        });

      return [...results].sort(
        (first, second) => {
          switch (sortOption) {
            case "value-high":
              return (
                Number(
                  second.purchase_price ??
                    0
                ) -
                Number(
                  first.purchase_price ??
                    0
                )
              );

            case "value-low":
              return (
                Number(
                  first.purchase_price ??
                    0
                ) -
                Number(
                  second.purchase_price ??
                    0
                )
              );

            case "warranty-soon": {
              const firstTime =
                first.warranty_date
                  ? new Date(
                      first.warranty_date +
                        "T00:00:00"
                    ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              const secondTime =
                second.warranty_date
                  ? new Date(
                      second.warranty_date +
                        "T00:00:00"
                    ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              return (
                firstTime -
                secondTime
              );
            }

            default:
              return String(
                first.device_name ?? ""
              ).localeCompare(
                String(
                  second.device_name ?? ""
                )
              );
          }
        }
      );
    }, [
      devices,
      searchTerm,
      selectedCategory,
      selectedLocation,
      sortOption,
    ]);

  const protectedValue = useMemo(
    () =>
      devices.reduce(
        (total, device) =>
          total +
          Number(
            device.purchase_price ?? 0
          ),
        0
      ),
    [devices]
  );

  const activeWarrantyCount =
    useMemo(
      () =>
        devices.filter((device) =>
          hasActiveWarranty(
            device.warranty_date
          )
        ).length,
      [devices]
    );

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedLocation !== "All" ||
    sortOption !== "name";

  const loading =
    permissionsLoading ||
    loadingDevices;

  const deviceLimitReached =
    !hasUnlimitedDevices &&
    deviceLimit !== null &&
    devices.length >= deviceLimit;

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortOption("name");
    setShowFilters(false);

    router.replace("/devices");
  }

  function handleAddDevice() {
    if (isDemo) {
      router.push("/signup");
      return;
    }

    if (!canCreate) {
      router.push("/signup");
      return;
    }

    if (deviceLimitReached) {
      router.push(
        "/upgrade?reason=device-limit"
      );

      return;
    }

    router.push("/devices/add");
  }

  return (
    <PageShell>
      <PageHero
        section="technology"
        eyebrow="Personal Vault"
        title="Your devices."
        description="Everything you own, organized in one calm and secure place."
      >
        {canCreate ? (
          <Button
            type="button"
            onClick={handleAddDevice}
          >
            <Plus size={17} />
            {deviceLimitReached
              ? "Upgrade to Add More"
              : "Add Device"}
          </Button>
        ) : !user ? (
          <Button href="/signup">
            <Plus size={17} />
            Create Your Vault
          </Button>
        ) : (
          <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm font-medium text-text-secondary shadow-[var(--shadow-sm)]">
            Viewer Access · Read Only
          </div>
        )}
      </PageHero>

      <ViewerBanner
        description={
          user
            ? "You can view shared devices, search records, and open device details. Viewer access cannot add, edit, upload, or delete devices."
            : "You are browsing a sample device vault. Create an account to organize and manage your own technology."
        }
      />

      {errorMessage && (
        <PageCard className="border-danger/30 bg-danger-soft text-danger">
          {errorMessage}
        </PageCard>
      )}

      {!loading &&
        devices.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Devices"
              value={devices.length.toLocaleString()}
              icon={Laptop}
            />

            <SummaryCard
              label="Protected Value"
              value={formatCurrency(
                protectedValue
              )}
              icon={ShieldCheck}
            />

            <SummaryCard
              label="Active Warranties"
              value={activeWarrantyCount.toLocaleString()}
              icon={Check}
            />
          </section>
        )}

      {!loading &&
        devices.length > 0 && (
          <PageCard className="p-5 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search your devices..."
                    className="w-full rounded-2xl border border-border-subtle bg-surface-sunken py-3.5 pl-11 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary htv-focus-ring focus:border-interaction focus:bg-surface-card focus:ring-4 focus:ring-interaction/15"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-primary"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (current) =>
                        !current
                    )
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-white px-5 text-sm font-semibold text-text-primary transition hover:border-border-strong"
                >
                  <SlidersHorizontal
                    size={17}
                  />

                  Filters

                  {filtersActive && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-charcoal px-1.5 text-[10px] text-white">
                      {
                        [
                          selectedCategory !==
                            "All",
                          selectedLocation !==
                            "All",
                          sortOption !==
                            "name",
                        ].filter(Boolean)
                          .length
                      }
                    </span>
                  )}

                  <ChevronDown
                    size={16}
                    className={
                      "transition " +
                      (showFilters
                        ? "rotate-180"
                        : "")
                    }
                  />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={
                          "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition " +
                          (active
                            ? "bg-charcoal text-surface-card"
                            : "border border-border-subtle bg-white text-text-secondary hover:border-interaction hover:text-text-primary")
                        }
                      >
                        {category}
                      </button>
                    );
                  }
                )}
              </div>

              {showFilters && (
                <div className="grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      Location
                    </span>

                    <select
                      value={
                        selectedLocation
                      }
                      onChange={(event) =>
                        setSelectedLocation(
                          event.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm outline-none transition focus:border-interaction"
                    >
                      {locations.map(
                        (location) => (
                          <option
                            key={location}
                            value={location}
                          >
                            {location ===
                            "All"
                              ? "All Locations"
                              : location}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      Sort By
                    </span>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target
                            .value as SortOption
                        )
                      }
                      className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm outline-none transition focus:border-interaction"
                    >
                      <option value="name">
                        Device Name
                      </option>

                      <option value="value-high">
                        Highest Value
                      </option>

                      <option value="value-low">
                        Lowest Value
                      </option>

                      <option value="warranty-soon">
                        Warranty Expiring
                      </option>
                    </select>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <p className="text-sm text-text-secondary">
                  {filteredDevices.length}{" "}
                  {filteredDevices.length ===
                  1
                    ? "device"
                    : "devices"}
                </p>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition hover:text-achievement"
                  >
                    <X size={15} />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </PageCard>
        )}

      {loading ? (
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading your devices...
          </div>
        </PageCard>
      ) : filteredDevices.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map(
            (device) => (
              <ModernDeviceCard
                key={device.id}
                device={device}
              />
            )
          )}
        </section>
      ) : devices.length > 0 ? (
        <EmptyState
          icon={Filter}
          title="No matching devices"
          description="Try a different search, category, or location."
          section="technology"
        >
          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <EmptyState
          icon={Laptop}
          title="Your technology deserves a home"
          description="Add your first device to organize its photos, purchase details, warranty, and documents in one calm place."
          section="technology"
        >
          {canCreate ? (
            <Button
              type="button"
              onClick={handleAddDevice}
              className="mt-6"
            >
              <Plus size={17} aria-hidden />
              {deviceLimitReached
                ? "Upgrade to add more"
                : "Add your first device"}
            </Button>
          ) : !user ? (
            <Button
              href="/signup"
              className="mt-6"
            >
              <Plus size={17} aria-hidden />
              Create your vault
            </Button>
          ) : (
            <div className="mx-auto mt-6 max-w-md rounded-[var(--radius-button)] bg-surface-sunken px-5 py-4 text-sm text-text-secondary">
              You have viewer access. You can view
              shared devices, but you cannot add or
              change them.
            </div>
          )}
        </EmptyState>
      )}

      {!isDemo &&
        !loading &&
        canCreate &&
        !hasUnlimitedDevices &&
        deviceLimit !== null && (
          <PageCard className="p-5 md:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-overline text-section-technology">
                  Your Plan
                </p>

                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {devices.length} of{" "}
                  {deviceLimit} devices used
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  Upgrade for unlimited
                  device tracking.
                </p>
              </div>

              <Button
                href="/upgrade"
                variant="secondary"
              >
                View Upgrade
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-home-health transition-all"
                style={{
                  width:
                    String(
                      Math.min(
                        (devices.length /
                          deviceLimit) *
                          100,
                        100
                      )
                    ) + "%",
                }}
              />
            </div>
          </PageCard>
        )}
    </PageShell>
  );
}

function ModernDeviceCard({
  device,
}: {
  device: DeviceRecord;
}) {
  const warranty =
    getWarrantyStatus(
      device.warranty_date
    );

  return (
    <Link
      href={
        "/devices/" +
        device.id
      }
      className="group overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-warning/40 hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative">
        <DeviceImageDisplay
          device={device}
          variant="card"
          className="transition duration-500 group-hover:scale-[1.01]"
        />

        {device.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm backdrop-blur">
            {device.category}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-text-primary">
              {device.device_name ||
                "Unnamed Device"}
            </h2>

            <p className="mt-1 truncate text-sm text-text-secondary">
              {[
                device.brand,
                device.model_number,
              ]
                .filter(Boolean)
                .join(" · ") ||
                "Device details"}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-text-tertiary shadow-[var(--shadow-inset)] transition group-hover:bg-charcoal group-hover:text-surface-card">
            <ArrowRight size={17} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {device.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-medium text-text-secondary">
              <MapPin size={13} />
              {device.location}
            </span>
          )}

          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium " +
              warranty.className
            }
          >
            <ShieldCheck size={13} />
            {warranty.label}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-[#EEE9DF] pt-4">
          <div>
            <p className="text-xs text-text-tertiary">
              Purchase Value
            </p>

            <p className="mt-1 font-semibold text-text-primary">
              {device.purchase_price
                ? formatCurrency(
                    Number(
                      device.purchase_price
                    )
                  )
                : "Not recorded"}
            </p>
          </div>

          <span className="text-sm font-semibold text-achievement">
            View device
          </span>
        </div>
      </div>
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Laptop;
}) {
  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function hasActiveWarranty(
  warrantyDate:
    | string
    | null
    | undefined
) {
  if (!warrantyDate) {
    return false;
  }

  const expiration = new Date(
    warrantyDate + "T23:59:59"
  );

  return (
    !Number.isNaN(
      expiration.getTime()
    ) &&
    expiration.getTime() >=
      Date.now()
  );
}

function getWarrantyStatus(
  warrantyDate:
    | string
    | null
    | undefined
) {
  if (!warrantyDate) {
    return {
      label: "No warranty",
      className:
        "bg-surface-sunken text-text-secondary",
    };
  }

  const expiration = new Date(
    warrantyDate + "T23:59:59"
  );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return {
      label: "Warranty unknown",
      className:
        "bg-surface-sunken text-text-secondary",
    };
  }

  const daysRemaining = Math.ceil(
    (expiration.getTime() -
      Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Warranty expired",
      className:
        "bg-danger-soft text-danger",
    };
  }

  if (daysRemaining <= 60) {
    return {
      label:
        String(daysRemaining) +
        " days left",
      className:
        "bg-warning-soft text-warning",
    };
  }

  return {
    label: "Warranty active",
    className:
      "bg-home-health-soft text-home-health",
  };
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  );
}