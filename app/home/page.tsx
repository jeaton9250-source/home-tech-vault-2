"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  ChefHat,
  CircleAlert,
  FileText,
  Gamepad2,
  Home,
  ImageIcon,
  Laptop,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Sofa,
  Trees,
  Warehouse,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PremiumGate from "@/components/PremiumGate";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
};

type DeviceReferenceRow = {
  device_id: string;
};

type HomeDevice = {
  id: string;
  deviceName: string;
  brand: string;
  category: string;
  location: string;
  purchasePrice: number;
  warrantyDate: string;
  hasPhoto: boolean;
  hasDocument: boolean;
};

type RoomSummary = {
  name: string;
  devices: HomeDevice[];
  deviceCount: number;
  protectedValue: number;
  photoCount: number;
  documentCount: number;
  completeness: number;
  expiringWarrantyCount: number;
};

type RoomIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

const demoHomeDevices: HomeDevice[] = [
  {
    id: "demo-home-1",
    deviceName: "Samsung OLED TV",
    brand: "Samsung",
    category: "TV",
    location: "Living Room",
    purchasePrice: 1799,
    warrantyDate: "2027-04-18",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-2",
    deviceName: "Apple TV 4K",
    brand: "Apple",
    category: "Streaming Device",
    location: "Living Room",
    purchasePrice: 149,
    warrantyDate: "2027-01-20",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-3",
    deviceName: "PlayStation 5",
    brand: "Sony",
    category: "Gaming",
    location: "Living Room",
    purchasePrice: 499,
    warrantyDate: "2026-10-12",
    hasPhoto: true,
    hasDocument: false,
  },
  {
    id: "demo-home-4",
    deviceName: "MacBook Pro",
    brand: "Apple",
    category: "Computer",
    location: "Home Office",
    purchasePrice: 2499,
    warrantyDate: "2027-03-12",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-5",
    deviceName: "Studio Display",
    brand: "Apple",
    category: "Monitor",
    location: "Home Office",
    purchasePrice: 1599,
    warrantyDate: "2027-02-09",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-6",
    deviceName: "Brother Printer",
    brand: "Brother",
    category: "Printer",
    location: "Home Office",
    purchasePrice: 329,
    warrantyDate: "2026-09-15",
    hasPhoto: false,
    hasDocument: false,
  },
  {
    id: "demo-home-7",
    deviceName: "HomePod Mini",
    brand: "Apple",
    category: "Audio",
    location: "Bedroom",
    purchasePrice: 99,
    warrantyDate: "2027-05-01",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-8",
    deviceName: "Smart Air Purifier",
    brand: "Levoit",
    category: "Smart Home",
    location: "Bedroom",
    purchasePrice: 229,
    warrantyDate: "2026-08-01",
    hasPhoto: false,
    hasDocument: true,
  },
  {
    id: "demo-home-9",
    deviceName: "Nest Hub",
    brand: "Google",
    category: "Smart Home",
    location: "Kitchen",
    purchasePrice: 99,
    warrantyDate: "2027-06-18",
    hasPhoto: true,
    hasDocument: true,
  },
  {
    id: "demo-home-10",
    deviceName: "Garage Camera",
    brand: "Ring",
    category: "Security",
    location: "Garage",
    purchasePrice: 179,
    warrantyDate: "2026-11-12",
    hasPhoto: true,
    hasDocument: false,
  },
];

function RoomsContent() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [devices, setDevices] =
    useState<HomeDevice[]>([]);

  const [householdName, setHouseholdName] =
    useState("My Home");

  const [loadingRooms, setLoadingRooms] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  useEffect(() => {
    async function loadRooms() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingRooms(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices(demoHomeDevices);
          setHouseholdName(
            "The Demo Household"
          );
          return;
        }

        const [
          profileResult,
          devicesResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "full_name, household_name"
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("devices")
            .select(
              `
                id,
                device_name,
                brand,
                category,
                location,
                purchase_price,
                warranty_date
              `
            )
            .eq("user_id", user.id),
        ]);

        if (profileResult.error) {
          console.error(
            "Unable to load home profile:",
            profileResult.error
          );
        }

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        const displayName =
          profileResult.data
            ?.full_name
            ?.trim() ||
          user.email?.split("@")[0] ||
          "Homeowner";

        const firstName =
          displayName.split(" ")[0];

        setHouseholdName(
          profileResult.data
            ?.household_name
            ?.trim() ||
            `${firstName}'s Home`
        );

        const deviceRows =
          (devicesResult.data ||
            []) as DeviceRow[];

        if (
          deviceRows.length === 0
        ) {
          setDevices([]);
          return;
        }

        const deviceIds =
          deviceRows.map(
            (device) => device.id
          );

        const [
          imageResult,
          documentResult,
        ] = await Promise.all([
          supabase
            .from("device_images")
            .select("device_id")
            .eq("user_id", user.id)
            .in(
              "device_id",
              deviceIds
            ),

          supabase
            .from(
              "device_documents"
            )
            .select("device_id")
            .eq("user_id", user.id)
            .in(
              "device_id",
              deviceIds
            ),
        ]);

        if (imageResult.error) {
          console.error(
            "Unable to load room photos:",
            imageResult.error
          );
        }

        if (documentResult.error) {
          console.error(
            "Unable to load room documents:",
            documentResult.error
          );
        }

        const deviceIdsWithPhotos =
          new Set(
            (
              (imageResult.data ||
                []) as DeviceReferenceRow[]
            ).map(
              (row) => row.device_id
            )
          );

        const deviceIdsWithDocuments =
          new Set(
            (
              (documentResult.data ||
                []) as DeviceReferenceRow[]
            ).map(
              (row) => row.device_id
            )
          );

        setDevices(
          deviceRows.map(
            (device) => ({
              id: device.id,
              deviceName:
                device.device_name ||
                "Unnamed Device",
              brand:
                device.brand || "",
              category:
                device.category || "",
              location:
                device.location
                  ?.trim() ||
                "Unassigned",
              purchasePrice:
                Number(
                  device.purchase_price ||
                    0
                ),
              warrantyDate:
                device.warranty_date ||
                "",
              hasPhoto:
                deviceIdsWithPhotos.has(
                  device.id
                ),
              hasDocument:
                deviceIdsWithDocuments.has(
                  device.id
                ),
            })
          )
        );
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Rooms loading error:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load your rooms."
        );
      } finally {
        setLoadingRooms(false);
      }
    }

    loadRooms();
  }, [
    user,
    isDemo,
    demoLoading,
  ]);

  const rooms = useMemo(() => {
    const groupedRooms =
      new Map<
        string,
        HomeDevice[]
      >();

    for (const device of devices) {
      const roomName =
        device.location.trim() ||
        "Unassigned";

      const roomDevices =
        groupedRooms.get(roomName) ||
        [];

      roomDevices.push(device);

      groupedRooms.set(
        roomName,
        roomDevices
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from(
      groupedRooms.entries()
    )
      .map(
        ([
          name,
          roomDevices,
        ]) => {
          const photoCount =
            roomDevices.filter(
              (device) =>
                device.hasPhoto
            ).length;

          const documentCount =
            roomDevices.filter(
              (device) =>
                device.hasDocument
            ).length;

          const possibleItems =
            roomDevices.length * 2;

          const completeness =
            possibleItems === 0
              ? 0
              : Math.round(
                  ((photoCount +
                    documentCount) /
                    possibleItems) *
                    100
                );

          const expiringWarrantyCount =
            roomDevices.filter(
              (device) => {
                if (
                  !device.warrantyDate
                ) {
                  return false;
                }

                const expiration =
                  new Date(
                    `${device.warrantyDate}T23:59:59`
                  );

                const daysRemaining =
                  Math.ceil(
                    (expiration.getTime() -
                      today.getTime()) /
                      (1000 *
                        60 *
                        60 *
                        24)
                  );

                return (
                  daysRemaining >= 0 &&
                  daysRemaining <= 90
                );
              }
            ).length;

          return {
            name,
            devices: roomDevices,
            deviceCount:
              roomDevices.length,
            protectedValue:
              roomDevices.reduce(
                (
                  total,
                  device
                ) =>
                  total +
                  device.purchasePrice,
                0
              ),
            photoCount,
            documentCount,
            completeness,
            expiringWarrantyCount,
          } satisfies RoomSummary;
        }
      )
      .sort(
        (first, second) => {
          if (
            first.name ===
            "Unassigned"
          ) {
            return 1;
          }

          if (
            second.name ===
            "Unassigned"
          ) {
            return -1;
          }

          return (
            second.protectedValue -
            first.protectedValue
          );
        }
      );
  }, [devices]);

  const filteredRooms =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return rooms;
      }

      return rooms.filter(
        (room) => {
          const roomMatches =
            room.name
              .toLowerCase()
              .includes(query);

          const deviceMatches =
            room.devices.some(
              (device) =>
                [
                  device.deviceName,
                  device.brand,
                  device.category,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(query)
            );

          return (
            roomMatches ||
            deviceMatches
          );
        }
      );
    }, [rooms, searchTerm]);

  const totalProtectedValue =
    devices.reduce(
      (total, device) =>
        total +
        device.purchasePrice,
      0
    );

  const documentedDeviceCount =
    devices.filter(
      (device) =>
        device.hasDocument
    ).length;

  const photographedDeviceCount =
    devices.filter(
      (device) =>
        device.hasPhoto
    ).length;

  const totalExpiringWarranties =
    rooms.reduce(
      (total, room) =>
        total +
        room.expiringWarrantyCount,
      0
    );

  const loading =
    demoLoading ||
    loadingRooms;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Building your rooms...
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
            Unable to load rooms
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
              {householdName}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your rooms.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Browse your technology
              the same way you think
              about your home.
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
            Premium Preview
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Explore how Home Tech
            Vault organizes an entire
            household by room.
          </p>
        </section>
      )}

      {devices.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Building2}
            label="Rooms"
            value={rooms.length.toLocaleString()}
          />

          <SummaryCard
            icon={Laptop}
            label="Devices"
            value={devices.length.toLocaleString()}
          />

          <SummaryCard
            icon={ShieldCheck}
            label="Protected Value"
            value={formatCurrency(
              totalProtectedValue
            )}
          />

          <SummaryCard
            icon={FileText}
            label="Documented"
            value={`${documentedDeviceCount}/${devices.length}`}
          />
        </section>
      )}

      {devices.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
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
                placeholder="Search rooms or devices..."
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

            <p className="shrink-0 text-sm text-neutral-500">
              {filteredRooms.length}{" "}
              {filteredRooms.length === 1
                ? "room"
                : "rooms"}
            </p>
          </div>
        </PageCard>
      )}

      {rooms.length === 0 ? (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Home size={29} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            Your home is ready
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Add your first device
            and assign it a room to
            begin building your home
            view.
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
            Add Your First Device
          </Button>
        </PageCard>
      ) : filteredRooms.length >
        0 ? (
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Room by Room
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                Explore your home
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
              <span>
                {
                  photographedDeviceCount
                }{" "}
                with photos
              </span>

              {totalExpiringWarranties >
                0 && (
                <span className="text-amber-700">
                  {
                    totalExpiringWarranties
                  }{" "}
                  warranties expiring
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map(
              (room) => (
                <RoomCard
                  key={room.name}
                  room={room}
                />
              )
            )}
          </div>
        </section>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching rooms
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try searching for a
            different room, device,
            brand, or category.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={() =>
              setSearchTerm("")
            }
          >
            Clear Search
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}

function RoomCard({
  room,
}: {
  room: RoomSummary;
}) {
  const Icon =
    getRoomIcon(room.name);

  const previewDevices =
    room.devices.slice(0, 4);

  const remainingDevices =
    room.deviceCount -
    previewDevices.length;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8C69D] hover:shadow-lg">
      <div className="relative bg-[#F7F5EF] px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white text-[#C8A96A] shadow-sm">
            <Icon size={25} />
          </div>

          <RoomStatusBadge
            completeness={
              room.completeness
            }
          />
        </div>

        <h3 className="mt-7 text-2xl font-semibold tracking-[-0.04em] text-[#111827]">
          {room.name}
        </h3>

        <p className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-500">
          <MapPin size={14} />

          {room.deviceCount}{" "}
          {room.deviceCount === 1
            ? "device"
            : "devices"}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {previewDevices.map(
            (device) => (
              <Link
                key={device.id}
                href={`/devices/${device.id}`}
                className="group/device flex items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  {device.hasPhoto ? (
                    <ImageIcon
                      size={17}
                    />
                  ) : (
                    <Laptop
                      size={17}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    {
                      device.deviceName
                    }
                  </p>

                  <p className="mt-0.5 truncate text-xs text-neutral-400">
                    {[
                      device.brand,
                      device.category,
                    ]
                      .filter(Boolean)
                      .join(" · ") ||
                      "Device"}
                  </p>
                </div>

                <ArrowRight
                  size={15}
                  className="shrink-0 text-neutral-300 transition group-hover/device:translate-x-0.5 group-hover/device:text-[#111827]"
                />
              </Link>
            )
          )}

          {remainingDevices > 0 && (
            <p className="pl-[52px] text-xs font-medium text-neutral-400">
              +{remainingDevices}{" "}
              more
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <RoomMetric
            label="Protected"
            value={formatCurrency(
              room.protectedValue
            )}
          />

          <RoomMetric
            label="Complete"
            value={`${room.completeness}%`}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#E8E2D6] pt-5">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>
              {room.photoCount} photos
            </span>

            <span>
              {
                room.documentCount
              }{" "}
              files
            </span>
          </div>

          <Link
            href={`/devices?search=${encodeURIComponent(
              room.name
            )}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A2F] transition hover:text-[#111827]"
          >
            View Room
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function RoomStatusBadge({
  completeness,
}: {
  completeness: number;
}) {
  if (completeness === 100) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        Complete
      </span>
    );
  }

  if (completeness >= 60) {
    return (
      <span className="rounded-full bg-[#FFF8E8] px-3 py-1.5 text-xs font-semibold text-[#8A6A2F]">
        {completeness}% complete
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <CircleAlert size={12} />
      Needs attention
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: RoomIcon;
  label: string;
  value: string;
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

function RoomMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs text-neutral-400">
        {label}
      </p>

      <p className="mt-2 truncate font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function getRoomIcon(
  roomName: string
): RoomIcon {
  const room =
    roomName.toLowerCase();

  if (
    room.includes("living") ||
    room.includes("family")
  ) {
    return Sofa;
  }

  if (
    room.includes("office") ||
    room.includes("study")
  ) {
    return Monitor;
  }

  if (room.includes("bed")) {
    return BedDouble;
  }

  if (
    room.includes("kitchen") ||
    room.includes("dining")
  ) {
    return ChefHat;
  }

  if (room.includes("garage")) {
    return Car;
  }

  if (room.includes("bath")) {
    return Bath;
  }

  if (
    room.includes("game") ||
    room.includes("media")
  ) {
    return Gamepad2;
  }

  if (
    room.includes("patio") ||
    room.includes("outdoor") ||
    room.includes("yard")
  ) {
    return Trees;
  }

  if (
    room.includes("storage") ||
    room.includes("attic") ||
    room.includes("basement")
  ) {
    return Warehouse;
  }

  if (
    room.includes("unassigned")
  ) {
    return CircleAlert;
  }

  return Home;
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

export default function HomePage() {
  const {
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  if (demoModeLoading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading rooms...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return <RoomsContent />;
  }

  return (
    <PremiumGate
      feature="Rooms"
      description="Organize your technology room by room, track protected value, and quickly see what is stored throughout your home."
    >
      <RoomsContent />
    </PremiumGate>
  );
}