"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Filter,
  Laptop,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { type Device as BaseDevice } from "@/lib/calculateTechnologyScore";
import DeviceCard from "@/components/DeviceCard";
import PageTitle from "@/components/ui/PageTitle";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceRecord = BaseDevice & {
  id: string;
  user_id?: string;
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

const demoDevices: DeviceRecord[] = [
  {
    id: "demo-1",
    device_name: "MacBook Pro",
    brand: "Apple",
    category: "Computer",
    model_number: "M3 Pro",
    serial_number: "Demo Serial",
    purchase_date: "2025-03-12",
    warranty_date: "2027-03-12",
    purchase_price: 1899,
    location: "Home Office",
    notes: "Demo device",
    photo_url: "",
  },
  {
    id: "demo-2",
    device_name: "Samsung Smart TV",
    brand: "Samsung",
    category: "TV",
    model_number: "QLED",
    serial_number: "",
    purchase_date: "2024-08-10",
    warranty_date: "",
    purchase_price: 899,
    location: "Living Room",
    notes: "Demo device",
    photo_url: "",
  },
];

export default function DevicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDemo, setIsDemo] = useState(true);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortOption, setSortOption] =
    useState<SortOption>("name");

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearchTerm(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setIsDemo(true);
          setDevices(demoDevices);
          return;
        }

        setIsDemo(false);

        const { data: deviceData, error: deviceError } =
          await supabase
            .from("devices")
            .select("*")
            .eq("user_id", user.id);

        if (deviceError) {
          throw deviceError;
        }

        const loadedDevices =
          (deviceData || []) as DeviceRecord[];

        if (loadedDevices.length === 0) {
          setDevices([]);
          return;
        }

        const deviceIds = loadedDevices.map(
          (device) => device.id
        );

        const { data: imageData, error: imageError } =
          await supabase
            .from("device_images")
            .select("device_id, image_url")
            .eq("user_id", user.id)
            .in("device_id", deviceIds)
            .order("created_at", { ascending: true });

        if (imageError) {
          console.error(
            "Unable to load device images:",
            imageError
          );

          setDevices(loadedDevices);
          return;
        }

        const firstImageByDevice = new Map<string, string>();

        for (const image of
          (imageData || []) as DeviceImageRecord[]) {
          if (!firstImageByDevice.has(image.device_id)) {
            firstImageByDevice.set(
              image.device_id,
              image.image_url
            );
          }
        }

        const devicesWithPhotos = await Promise.all(
          loadedDevices.map(async (device) => {
            const imagePath =
              firstImageByDevice.get(device.id);

            if (!imagePath) {
              return {
                ...device,
                photo_url: "",
              };
            }

            const {
              data: signedData,
              error: signedError,
            } = await supabase.storage
              .from("device-images")
              .createSignedUrl(imagePath, 3600);

            if (signedError) {
              console.error(
                `Unable to create photo URL for ${device.device_name}:`,
                signedError
              );
            }

            return {
              ...device,
              photo_url: signedData?.signedUrl || "",
            };
          })
        );

        setDevices(devicesWithPhotos);
      } catch (error) {
        console.error("Unable to load devices:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Unable to load your devices."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  const categories = useMemo(() => {
    const values = devices
      .map((device) => device.category?.trim())
      .filter(
        (value): value is string => Boolean(value)
      );

    return [
      "All",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [devices]);

  const locations = useMemo(() => {
    const values = devices
      .map((device) => device.location?.trim())
      .filter(
        (value): value is string => Boolean(value)
      );

    return [
      "All",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    let results = devices.filter((device) => {
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
          String(value ?? "").toLowerCase()
        )
        .join(" ");

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        String(device.category ?? "").trim() ===
          selectedCategory;

      const matchesLocation =
        selectedLocation === "All" ||
        String(device.location ?? "").trim() ===
          selectedLocation;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });

    results = [...results].sort((a, b) => {
      switch (sortOption) {
        case "value-high":
          return (
            Number(b.purchase_price ?? 0) -
            Number(a.purchase_price ?? 0)
          );

        case "value-low":
          return (
            Number(a.purchase_price ?? 0) -
            Number(b.purchase_price ?? 0)
          );

        case "warranty-soon": {
          const aTime = a.warranty_date
            ? new Date(
                `${a.warranty_date}T00:00:00`
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

          const bTime = b.warranty_date
            ? new Date(
                `${b.warranty_date}T00:00:00`
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

          return aTime - bTime;
        }

        default:
          return String(
            a.device_name ?? ""
          ).localeCompare(
            String(b.device_name ?? "")
          );
      }
    });

    return results;
  }, [
    devices,
    searchTerm,
    selectedCategory,
    selectedLocation,
    sortOption,
  ]);

  const filtersActive =
    searchTerm !== "" ||
    selectedCategory !== "All" ||
    selectedLocation !== "All" ||
    sortOption !== "name";

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortOption("name");
    router.replace("/devices");
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Personal Vault"
        title={
          isDemo
            ? "Demo Device Inventory"
            : "Device Inventory"
        }
        description={
          isDemo
            ? "You are viewing sample devices. Sign in to manage your own vault."
            : "Search, filter, and manage the technology saved in your vault."
        }
        action={
          <Button
            href={
              isDemo ? "/login" : "/devices/add"
            }
          >
            {isDemo
              ? "Create Your Vault"
              : "+ Add Device"}
          </Button>
        }
      />

      {!loading && devices.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              className="text-[#C8A96A]"
            />

            <h2 className="font-semibold text-[#111827]">
              Search and Filter
            </h2>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search devices, brands, models, or rooms..."
                className="w-full rounded-xl border border-[#E8E2D6] bg-white py-3 pl-11 pr-4 outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(event) =>
                setSelectedLocation(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            >
              {locations.map((location) => (
                <option
                  key={location}
                  value={location}
                >
                  {location === "All"
                    ? "All Locations"
                    : location}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target.value as SortOption
                )
              }
              className="rounded-xl border border-[#E8E2D6] bg-white px-4 py-3 outline-none focus:border-[#C8A96A]"
            >
              <option value="name">
                Sort: Name
              </option>

              <option value="value-high">
                Highest Value
              </option>

              <option value="value-low">
                Lowest Value
              </option>

              <option value="warranty-soon">
                Warranty Expiring Soon
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Showing {filteredDevices.length} of{" "}
              {devices.length} device
              {devices.length === 1 ? "" : "s"}
            </p>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F7F5EF]"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </PageCard>
      )}

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading your devices...
          </div>
        </PageCard>
      ) : filteredDevices.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
            />
          ))}
        </section>
      ) : devices.length > 0 ? (
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Filter size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            No matching devices
          </h2>

          <p className="mt-3 text-neutral-500">
            Try changing your search, category,
            location, or sorting options.
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
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            Your vault is ready
          </h2>

          <p className="mx-auto mt-3 max-w-md text-neutral-500">
            Add your first device to begin
            tracking photos, warranties, purchase
            details, and documents.
          </p>

          <Button
            href={
              isDemo ? "/login" : "/devices/add"
            }
            className="mt-6"
          >
            {isDemo
              ? "Create Your Vault"
              : "Add Your First Device"}
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}