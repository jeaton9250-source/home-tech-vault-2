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
  ImageIcon,
  Laptop,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  type Device as BaseDevice,
} from "@/lib/calculateTechnologyScore";

import { demoDevices } from "@/lib/demoData";

import { useDemoMode } from "@/hooks/useDemoMode";
import { useSubscription } from "@/hooks/useSubscription";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceRecord = BaseDevice & {
  id: string;
  user_id?: string;
  household_id?: string | null;
  device_name: string;
  photo_url?: string;
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
  const searchParams = useSearchParams();

  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const {
    deviceLimit,
    hasUnlimitedDevices,
    loading: subscriptionLoading,
  } = useSubscription();

  const [devices, setDevices] =
    useState<DeviceRecord[]>([]);

  const [loadingDevices, setLoadingDevices] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

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
      searchParams.get("search") || "";

    setSearchTerm(searchFromUrl);
  }, [searchParams]);

   useEffect(() => {
  async function loadDevices() {
    if (demoModeLoading) {
      return;
    }

    try {
      setLoadingDevices(true);
      setErrorMessage("");

      if (isDemo) {
        const sampleDevices: DeviceRecord[] =
          demoDevices.map((device) => ({
            id: device.id,
            device_name:
              device.device_name,
            brand: device.brand,
            category: device.category,
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
            location: device.location,
            notes: device.notes,
            online: device.online,
            last_seen_at:
              device.last_seen_at,
            ip_address:
              device.ip_address,
            photo_url:
              device.photo_url || "",
          }));

        setDevices(sampleDevices);
        return;
      }

      if (!user) {
        setDevices([]);
        return;
      }

      /*
       * Find the household that the signed-in user belongs to.
       */
      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      /*
       * Users without a household can still see their
       * own personal devices.
       */
      let deviceQuery =
        supabase
          .from("devices")
          .select("*");

      if (membership?.household_id) {
        deviceQuery =
          deviceQuery.eq(
            "household_id",
            membership.household_id
          );
      } else {
        deviceQuery =
          deviceQuery.eq(
            "user_id",
            user.id
          );
      }

      const {
        data: deviceData,
        error: deviceError,
      } = await deviceQuery;

      if (deviceError) {
        throw deviceError;
      }

      const loadedDevices =
        (deviceData ||
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

      /*
       * Device images are loaded by device ID.
       * Do not filter these by the current user's user_id,
       * because shared devices may have been created by
       * another household member.
       */
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

        setDevices(
          loadedDevices.map(
            (device) => ({
              ...device,
              photo_url:
                device.photo_url || "",
            })
          )
        );

        return;
      }

      const firstImageByDevice =
        new Map<string, string>();

      for (
        const image of
        (imageData ||
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
                    device.photo_url ||
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
                  `Unable to create photo URL for ${device.device_name}:`,
                  signedError
                );
              }

              return {
                ...device,
                photo_url:
                  signedData
                    ?.signedUrl || "",
              };
            }
          )
        );

      setDevices(
        devicesWithPhotos
      );
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      console.error(
        "Unable to load devices:",
        error
      );

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to load your devices."
      );
    } finally {
      setLoadingDevices(false);
    }
  }

  void loadDevices();
}, [
  user,
  isDemo,
  demoModeLoading,
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
              String(
                value ?? ""
              ).toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            normalizedSearch === "" ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesCategory =
            selectedCategory ===
              "All" ||
            String(
              device.category ?? ""
            ).trim() ===
              selectedCategory;

          const matchesLocation =
            selectedLocation ===
              "All" ||
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
                      `${first.warranty_date}T00:00:00`
                    ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              const secondTime =
                second.warranty_date
                  ? new Date(
                      `${second.warranty_date}T00:00:00`
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
            device.purchase_price || 0
          ),
        0
      ),
    [devices]
  );

  const activeWarrantyCount = useMemo(
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
    demoModeLoading ||
    subscriptionLoading ||
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
      <section className="rounded-[32px] bg-[#111827] px-6 py-8 text-white shadow-sm md:px-9 md:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Personal Vault
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your devices.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Everything you own, organized
              in one calm and secure place.
            </p>
          </div>

          <Button
            onClick={handleAddDevice}
            variant="secondary"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : deviceLimitReached
                ? "Upgrade to Add More"
                : "Add Device"}
          </Button>
        </div>
      </section>

      {isDemo && !loading && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            You are browsing a sample
            household. Create an account to
            organize your own devices.
          </p>
        </section>
      )}

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
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
                    placeholder="Search your devices..."
                    className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:bg-white focus:ring-4 focus:ring-[#C8A96A]/10"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-[#111827]"
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#E8E2D6] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:border-[#C8A96A]"
                >
                  <SlidersHorizontal
                    size={17}
                  />

                  Filters

                  {filtersActive && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111827] px-1.5 text-[10px] text-white">
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
                    className={`transition ${
                      showFilters
                        ? "rotate-180"
                        : ""
                    }`}
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
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-[#111827] text-white"
                            : "border border-[#E8E2D6] bg-white text-neutral-500 hover:border-[#C8A96A] hover:text-[#111827]"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  }
                )}
              </div>

              {showFilters && (
                <div className="grid gap-3 border-t border-[#E8E2D6] pt-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
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
                      className="w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C8A96A]"
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
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
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
                      className="w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C8A96A]"
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

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D6] pt-4">
                <p className="text-sm text-neutral-500">
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

      {loading ? (
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading your devices...
          </div>
        </PageCard>
      ) : filteredDevices.length >
        0 ? (
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
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Filter size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching devices
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try a different search,
            category, or location.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </PageCard>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Laptop size={29} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            Your vault is ready
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Add your first device to
            organize its photos, purchase
            information, warranty, and
            documents.
          </p>

          <Button
            onClick={handleAddDevice}
            className="mt-6"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : deviceLimitReached
                ? "Upgrade to Add More"
                : "Add Your First Device"}
          </Button>
        </PageCard>
      )}

      {!isDemo &&
        !loading &&
        !hasUnlimitedDevices &&
        deviceLimit !== null && (
          <PageCard className="p-5 md:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                  Your Plan
                </p>

                <p className="mt-2 text-lg font-semibold text-[#111827]">
                  {devices.length} of{" "}
                  {deviceLimit} devices used
                </p>

                <p className="mt-1 text-sm text-neutral-500">
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

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
              <div
                className="h-full rounded-full bg-[#111827] transition-all"
                style={{
                  width: `${Math.min(
                    (devices.length /
                      deviceLimit) *
                      100,
                    100
                  )}%`,
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
      href={`/devices/${device.id}`}
      className="group overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D7C79F] hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5EF]">
        {device.photo_url ? (
          <img
            src={device.photo_url}
            alt={device.device_name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#C8A96A]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
              <ImageIcon size={28} />
            </div>

            <p className="mt-3 text-xs font-medium text-neutral-400">
              No photo added
            </p>
          </div>
        )}

        {device.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111827] shadow-sm backdrop-blur">
            {device.category}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-[#111827]">
              {device.device_name ||
                "Unnamed Device"}
            </h2>

            <p className="mt-1 truncate text-sm text-neutral-500">
              {[
                device.brand,
                device.model_number,
              ]
                .filter(Boolean)
                .join(" · ") ||
                "Device details"}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F5EF] text-neutral-400 transition group-hover:bg-[#111827] group-hover:text-white">
            <ArrowRight size={17} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {device.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F5EF] px-3 py-1.5 text-xs font-medium text-neutral-600">
              <MapPin size={13} />
              {device.location}
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${warranty.className}`}
          >
            <ShieldCheck size={13} />
            {warranty.label}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-[#EEE9DF] pt-4">
          <div>
            <p className="text-xs text-neutral-400">
              Purchase Value
            </p>

            <p className="mt-1 font-semibold text-[#111827]">
              {device.purchase_price
                ? formatCurrency(
                    Number(
                      device.purchase_price
                    )
                  )
                : "Not recorded"}
            </p>
          </div>

          <span className="text-sm font-semibold text-[#8A6A2F]">
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
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
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
    `${warrantyDate}T23:59:59`
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
        "bg-neutral-100 text-neutral-500",
    };
  }

  const expiration = new Date(
    `${warrantyDate}T23:59:59`
  );

  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return {
      label: "Warranty unknown",
      className:
        "bg-neutral-100 text-neutral-500",
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
        "bg-red-50 text-red-700",
    };
  }

  if (daysRemaining <= 60) {
    return {
      label: `${daysRemaining} days left`,
      className:
        "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Warranty active",
    className:
      "bg-emerald-50 text-emerald-700",
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