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
  ChevronDown,
  Filter,
  Inbox,
  Laptop,
  Loader2,
  MapPin,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";

import { supabase } from "@/lib/supabase";
import {
  buildUuidRealtimeFilter,
  isSafeUuid,
} from "@/lib/security/supabaseFilters";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import type {
  Device as BaseDevice,
} from "@/lib/calculateTechnologyScore";
import { demoDevices } from "@/lib/demoData";
import { withDemoDevicePhoto } from "@/lib/devices/getDeviceImage";

import { usePermissions } from "@/hooks/usePermissions";
import { useHouseholdLimits } from "@/hooks/useHouseholdLimits";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  ViewerBanner,
} from "@/components/ui/PermissionUI";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { getDevicePresence } from "@/lib/devices/devicePresence";
import { normalizeMacAddress } from "@/lib/connector/network";
import {
  mergePresenceFromDiscovery,
  pickFreshestDiscoveryPresence,
} from "@/lib/devices/deviceNetworkTimestamps";
import { formatDemoDevicePresenceListLine } from "@/lib/demo/demoNetworkTime";

type DeviceRecord = BaseDevice & {
  id: string;
  user_id?: string;
  household_id?: string | null;
  device_name: string;
  photo_url?: string;
  demo_image?: string;
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
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
    role,
    canCreate,
    isViewer,
    loading: permissionsLoading,
  } = usePermissions();

  const quota = useHouseholdLimits();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const canAddDevices =
    role === "admin" ||
    role === "member";

  const showAddDeviceAction =
    !permissionsLoading &&
    (canCreate || canAddDevices) &&
    role !== "viewer";

  const showViewerAccess =
    !permissionsLoading &&
    !isDemo &&
    Boolean(user) &&
    role === "viewer";

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

  useEffect(() => {
    if (
      permissionsLoading ||
      isDemo ||
      !user ||
      !householdId ||
      devices.length === 0
    ) {
      return;
    }

    if (!isSafeUuid(householdId)) {
      console.warn(
        "Skipping device realtime subscription because the household identifier is invalid."
      );
      return;
    }

    let cancelled = false;
    const userId = user.id;

    async function refreshDevicePresence() {
      const { data, error } = await applyHouseholdScope(
        supabase
          .from("devices")
          .select(
            "id, mac_address, online, last_seen_at, first_seen_at, network_updated_at"
          ),
        householdId,
        userId
      );

      if (error || !data || cancelled) {
        return;
      }

      type PresenceRow = {
        id: string;
        mac_address?: string | null;
        online?: boolean | null;
        last_seen_at?: string | null;
        first_seen_at?: string | null;
        network_updated_at?: string | null;
      };

      type DiscoveryPresenceRow = {
        imported_device_id: string | null;
        mac_address?: string | null;
        online?: boolean | null;
        last_seen_at?: string | null;
      };

      const presenceRows = data as PresenceRow[];
      const deviceIds = presenceRows.map(
        (row) => row.id
      );
      const normalizedMacs = presenceRows
        .map((row) =>
          normalizeMacAddress(row.mac_address ?? "")
        )
        .filter(Boolean);

      const discoveryByDeviceId = new Map<
        string,
        DiscoveryPresenceRow[]
      >();
      const discoveryByMac = new Map<
        string,
        DiscoveryPresenceRow[]
      >();

      if (deviceIds.length > 0) {
        const { data: linkedDiscoveryRows } = await supabase
          .from("discovered_devices")
          .select(
            "imported_device_id, mac_address, online, last_seen_at"
          )
          .eq("household_id", householdId)
          .in("imported_device_id", deviceIds)
          .is("ignored_at", null);

        if (cancelled) {
          return;
        }

        for (const row of (linkedDiscoveryRows ??
          []) as DiscoveryPresenceRow[]) {
          if (!row.imported_device_id) {
            continue;
          }

          const existing =
            discoveryByDeviceId.get(row.imported_device_id) ??
            [];
          existing.push(row);
          discoveryByDeviceId.set(
            row.imported_device_id,
            existing
          );
        }
      }

      if (normalizedMacs.length > 0) {
        const normalizedMacSet = new Set(normalizedMacs);
        const { data: macDiscoveryRows } = await supabase
          .from("discovered_devices")
          .select(
            "imported_device_id, mac_address, online, last_seen_at"
          )
          .eq("household_id", householdId)
          .is("ignored_at", null)
          .not("mac_address", "is", null);

        if (cancelled) {
          return;
        }

        for (const row of (macDiscoveryRows ??
          []) as DiscoveryPresenceRow[]) {
          const mac = normalizeMacAddress(
            row.mac_address ?? ""
          );

          if (!mac || !normalizedMacSet.has(mac)) {
            continue;
          }

          const existing =
            discoveryByMac.get(mac) ?? [];
          existing.push(row);
          discoveryByMac.set(mac, existing);
        }
      }

      const presenceById = new Map(
        presenceRows.map((row) => {
          const mac = normalizeMacAddress(
            row.mac_address ?? ""
          );
          const linkedRows =
            discoveryByDeviceId.get(row.id) ?? [];
          const macRows = mac
            ? discoveryByMac.get(mac) ?? []
            : [];
          const mergedDiscoveryRows = [
            ...linkedRows,
            ...macRows.filter(
              (candidate) =>
                !linkedRows.some(
                  (linked) =>
                    linked.last_seen_at ===
                      candidate.last_seen_at &&
                    linked.mac_address ===
                      candidate.mac_address
                )
            ),
          ];

          const merged = mergePresenceFromDiscovery(
            row,
            pickFreshestDiscoveryPresence(
              mergedDiscoveryRows
            )
          );

          return [
            row.id,
            {
              ...row,
              online: merged.online,
              last_seen_at: merged.last_seen_at,
              network_updated_at: merged.network_updated_at,
            },
          ] as const;
        })
      );

      setDevices((currentDevices) =>
        currentDevices.map((device) => {
          const presence = presenceById.get(device.id);

          if (!presence) {
            return device;
          }

          return {
            ...device,
            online: presence.online,
            last_seen_at: presence.last_seen_at,
            first_seen_at: presence.first_seen_at,
            network_updated_at: presence.network_updated_at,
          };
        })
      );
    }

    void refreshDevicePresence();

    const intervalId = window.setInterval(() => {
      void refreshDevicePresence();
    }, 45_000);

    const channel = supabase
      .channel(`devices-presence-${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "devices",
          filter: buildUuidRealtimeFilter(
            "household_id",
            householdId
          ),
        },
        () => {
          void refreshDevicePresence();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "discovered_devices",
          filter: buildUuidRealtimeFilter(
            "household_id",
            householdId
          ),
        },
        () => {
          void refreshDevicePresence();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      void supabase.removeChannel(channel);
    };
  }, [
    devices.length,
    householdId,
    isDemo,
    permissionsLoading,
    user,
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
    loadingDevices ||
    quota.usageLoading;

  const deviceCount = Math.max(
    devices.length,
    quota.usage.devices
  );

  const deviceLimitReached =
    !loading &&
    quota.limits.maxDevices !== null &&
    deviceCount >= quota.limits.maxDevices;

  function getAddDeviceButtonLabel() {
    if (loading) {
      return "Checking allowance…";
    }

    if (role === "viewer" || isViewer) {
      return "Viewer · Read Only";
    }

    if (deviceLimitReached) {
      return quota.canUseProFeatures
        ? "Household limit reached"
        : "Upgrade Household";
    }

    return "Add Device";
  }

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
      showReadOnlyModal();
      return;
    }

    if (!canCreate && !canAddDevices) {
      if (role === "viewer" || isViewer) {
        router.push("/family");
        return;
      }

      router.push("/signup");
      return;
    }

    if (loading) {
      return;
    }

    if (deviceLimitReached) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

      router.push(
        "/upgrade?reason=device-limit"
      );

      return;
    }

    router.push("/devices/add");
  }

  function handleSmartImport() {
    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!user) {
      router.push("/signup");
      return;
    }

    if (
      role === "viewer" ||
      isViewer
    ) {
      router.push("/family");
      return;
    }

    router.push("/imports");
  }

  function handleWifiDiscovery() {
    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!user) {
      router.push("/signup");
      return;
    }

    router.push(
      "/network?tab=discovery"
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-7 lg:py-8 xl:px-8">
      <div data-tour="devices">
        <section className="mb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {isDemo ? "Interactive Demo" : "Home inventory"}
              </p>

              <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[38px]">
                {isDemo ? "Morgan Household devices" : "Devices"}
              </h1>

              <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
                {isDemo
                  ? "23 devices organized with photos, warranties, receipts, and notes."
                  : "Everything you own, organized in one calm place."}
              </p>

              {!loading && devices.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-slate-400">
                  <span>{devices.length.toLocaleString()} devices</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatCurrency(protectedValue)} protected</span>
                  <span aria-hidden="true">•</span>
                  <span>{activeWarrantyCount.toLocaleString()} active warranties</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!loading && role !== "viewer" ? (
                <>
                  <button
                    type="button"
                    onClick={handleSmartImport}
                    className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-4 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-[#718d4f]/35 hover:bg-[#f8f6f0] hover:text-[#526b39]"
                  >
                    <Inbox size={16} />
                    Smart Import
                  </button>

                  <button
                    type="button"
                    onClick={handleWifiDiscovery}
                    className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-4 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-[#718d4f]/35 hover:bg-[#f8f6f0] hover:text-[#526b39]"
                  >
                    <Radar size={16} />
                    Home Wi-Fi
                  </button>
                </>
              ) : null}

              {showAddDeviceAction ||
              (permissionsLoading && Boolean(user) && !isDemo) ? (
                <button
                  type="button"
                  onClick={handleAddDevice}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#617c43] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#526b39] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {getAddDeviceButtonLabel()}
                </button>
              ) : isDemo ? (
                <button
                  type="button"
                  onClick={handleAddDevice}
                  className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#617c43] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#526b39]"
                >
                  <Plus size={16} />
                  Add Device
                </button>
              ) : !user ? (
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#617c43] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#526b39]"
                >
                  <Plus size={16} />
                  Create Your Vault
                </Link>
              ) : showViewerAccess ? (
                <div className="inline-flex h-10 items-center rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-4 text-[13px] font-medium text-slate-500">
                  Viewer · Read Only
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {showViewerAccess ? (
        <ViewerBanner
          show
          description="You can view shared devices, search records, and open device details. Viewer access cannot add, edit, upload, or delete devices."
        />
      ) : null}

      {errorMessage ? (
        <div className="mb-5 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {!loading && devices.length > 0 ? (
        <section className="rounded-[22px] border border-[#e4e2dc] bg-[#fffefa] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search your devices..."
                className="h-11 w-full rounded-[13px] border border-[#e4e2dc] bg-[#f8f6f0]/80 pl-11 pr-11 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#b8c9a6] focus:bg-[#fffefa] focus:ring-4 focus:ring-[#617c43]/10"
              />

              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98a78d] transition hover:text-slate-700"
                >
                  <X size={17} />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[13px] border border-[#e4e2dc] bg-[#fffefa] px-4 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:border-[#718d4f]/35 hover:bg-[#f8f6f0]"
            >
              <SlidersHorizontal size={16} />
              Filters

              {filtersActive ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#617c43] px-1.5 text-[10px] text-white">
                  {[
                    selectedCategory !== "All",
                    selectedLocation !== "All",
                    sortOption !== "name",
                  ].filter(Boolean).length}
                </span>
              ) : null}

              <ChevronDown
                size={15}
                className={"transition " + (showFilters ? "rotate-180" : "")}
              />
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    "shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold transition " +
                    (active
                      ? "bg-[#617c43] text-white shadow-[0_5px_14px_-8px_rgba(82,107,57,0.85)]"
                      : "bg-[#f4f1ea] text-[#687466] hover:bg-slate-200 hover:text-slate-800")
                  }
                >
                  {category === "All"
                    ? "All"
                    : formatDeviceCategoryLabel(category)}
                </button>
              );
            })}
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-slate-500">
                  Location
                </span>

                <select
                  value={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  className="h-11 w-full rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-3 text-[13px] text-slate-700 outline-none focus:border-[#b8c9a6] focus:ring-4 focus:ring-[#617c43]/10"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location === "All" ? "All Locations" : location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold text-slate-500">
                  Sort By
                </span>

                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                  className="h-11 w-full rounded-[12px] border border-[#e4e2dc] bg-[#fffefa] px-3 text-[13px] text-slate-700 outline-none focus:border-[#b8c9a6] focus:ring-4 focus:ring-[#617c43]/10"
                >
                  <option value="name">Device Name</option>
                  <option value="value-high">Highest Value</option>
                  <option value="value-low">Lowest Value</option>
                  <option value="warranty-soon">Warranty Expiring</option>
                </select>
              </label>
            </div>
          ) : null}

          {filtersActive ? (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#617c43] transition hover:text-[#526b39]"
              >
                <X size={14} />
                Clear filters
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {loading ? (
        <div className="mt-4 flex min-h-72 items-center justify-center rounded-[22px] border border-[#e4e2dc] bg-[#fffefa]">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={21} />
            Loading your devices...
          </div>
        </div>
      ) : filteredDevices.length > 0 ? (
        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((device) => (
            <ModernDeviceCard key={device.id} device={device} isDemo={isDemo} />
          ))}
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
          {showAddDeviceAction ? (
            <Button
              type="button"
              onClick={handleAddDevice}
              className="mt-6"
              disabled={loading}
            >
              <Plus size={17} aria-hidden />
              {loading
                ? "Checking allowance…"
                : deviceLimitReached
                  ? quota.canUseProFeatures
                    ? "Household limit reached"
                    : "Upgrade Household"
                  : "Add your first device"}
            </Button>
          ) : isDemo ? (
            <Button type="button" onClick={handleAddDevice} className="mt-6">
              <Plus size={17} aria-hidden />
              Add your first device
            </Button>
          ) : !user ? (
            <Button href="/signup" className="mt-6">
              <Plus size={17} aria-hidden />
              Create your vault
            </Button>
          ) : showViewerAccess ? (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-[#e4e2dc] bg-[#fffefa] px-5 py-4 text-sm text-slate-500">
              You have viewer access. You can view shared devices, but you cannot add or change them.
            </div>
          ) : null}
        </EmptyState>
      )}

      {!isDemo &&
      !loading &&
      canCreate &&
      quota.limits.maxDevices !== null ? (
        <section className="mt-4 rounded-[22px] border border-[#e4e2dc] bg-[#fffefa] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Household allowance
              </p>

              <p className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
                {deviceCount} of {quota.limits.maxDevices} devices used
              </p>

              <p className="mt-1 text-[13px] text-slate-500">
                {quota.canUseProFeatures
                  ? "This household is on a Pro plan."
                  : "Upgrade the household for unlimited device tracking."}
              </p>
            </div>

            {!quota.canUseProFeatures && quota.canManageBilling ? (
              <Button href="/upgrade?reason=device-limit" variant="secondary">
                Upgrade Household
                <ArrowRight size={16} />
              </Button>
            ) : null}
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f4f1ea]">
            <div
              className="h-full rounded-full bg-[#617c43] transition-all"
              style={{
                width:
                  String(
                    Math.min(
                      (deviceCount / quota.limits.maxDevices) * 100,
                      100
                    )
                  ) + "%",
              }}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function formatDeviceCategoryLabel(
  category:
    | string
    | null
    | undefined
) {
  const normalized =
    String(
      category ?? ""
    )
      .trim()
      .toLowerCase();

  const categoryLabels:
    Record<string, string> = {
      firetv:
        "Fire TV",
      "fire tv":
        "Fire TV",
      gaming:
        "Gaming",
      game:
        "Gaming",
      mobile:
        "Mobile",
      phone:
        "Phone & Tablet",
      tablet:
        "Phone & Tablet",
      "phone / tablet":
        "Phone & Tablet",
      "phone & tablet":
        "Phone & Tablet",
      camera:
        "Cameras",
      cameras:
        "Cameras",
      light:
        "Lighting",
      lighting:
        "Lighting",
      television:
        "Televisions",
      televisions:
        "Televisions",
      tv:
        "Televisions",
      unknown:
        "Other",
      other:
        "Other",
    };

  return (
    categoryLabels[
      normalized
    ] ??
    String(
      category ??
        "Other"
    )
  );
}

function ModernDeviceCard({
  device,
  isDemo = false,
}: {
  device: DeviceRecord;
  isDemo?: boolean;
}) {
  const warranty = getWarrantyStatus(device.warranty_date);

  const presenceLine = isDemo
    ? formatDemoDevicePresenceListLine({
        online: device.online,
        lastSeenAt: device.last_seen_at,
        firstSeenAt: device.first_seen_at,
        networkUpdatedAt: device.network_updated_at,
      })
    : getDevicePresence({
        online: device.online,
        lastSeenAt: device.last_seen_at,
        firstSeenAt: device.first_seen_at,
        networkUpdatedAt: device.network_updated_at,
      }).listLine;

  return (
    <Link
      href={"/devices/" + device.id}
      className="group overflow-hidden rounded-[22px] border border-[#e4e2dc] bg-[#fffefa] shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-[#718d4f]/35 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="h-[160px] overflow-hidden bg-[#f8f6f0]">
        <DeviceImageDisplay
          device={device}
          variant="card"
          className="h-full w-full transition duration-500 group-hover:scale-[1.015]"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-slate-900">
              {device.device_name || "Unnamed Device"}
            </h2>

            <p className="mt-1 truncate text-[12px] text-slate-400">
              {[device.brand, device.model_number].filter(Boolean).join(" · ") ||
                formatDeviceCategoryLabel(device.category)}
            </p>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a5b19a] transition group-hover:translate-x-0.5 group-hover:bg-[#f8f6f0] group-hover:text-[#617c43]">
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-slate-500">
          <span
            className={
              "mt-[6px] h-2 w-2 shrink-0 rounded-full " +
              (device.online === true ? "bg-emerald-500" : "bg-slate-300")
            }
          />
          <span>{presenceLine}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {device.location ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f6f0] px-2.5 py-1.5">
              <MapPin size={11} className="text-[#829373]" />
              {device.location}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f6f0] px-2.5 py-1.5">
            <ShieldCheck size={11} className="text-[#829373]" />
            {warranty.label}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Value
          </span>

          <span className="text-[13px] font-semibold text-slate-700">
            {device.purchase_price
              ? formatCurrency(Number(device.purchase_price))
              : "—"}
          </span>
        </div>
      </div>
    </Link>
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
        "border border-[#182533]/8 bg-[#182533]/5 text-[#68737b]",
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
        "border border-[#182533]/8 bg-[#182533]/5 text-[#68737b]",
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
        "border border-[#a6584e]/15 bg-[#a6584e]/10 text-[#984e46]",
    };
  }

  if (daysRemaining <= 60) {
    return {
      label:
        String(daysRemaining) +
        " days left",
      className:
        "border border-[#b58a42]/15 bg-[#b58a42]/10 text-[#916c31]",
    };
  }

  return {
    label: "Warranty active",
    className:
      "border border-[#617c43]/15 bg-[#617c43]/10 text-[#526b39]",
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