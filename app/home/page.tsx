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
  Gamepad2,
  Home,
  ImageIcon,
  Laptop,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  Search,
  Sofa,
  Trees,
  Warehouse,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";

import FeatureGate from "@/components/permissions/FeatureGate";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ViewerBanner } from "@/components/ui/PermissionUI";
import { getDemoHomeDevices } from "@/lib/demo/homeDevices";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

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

function RoomsContent() {
  const {
    user,
    isDemo,
    householdId,
    canCreate,
    loading: permissionsLoading,
    getActionHref,
    getActionLabel,
  } = usePermissions();

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
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingRooms(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices(getDemoHomeDevices());
          setHouseholdName(MORGAN_HOUSEHOLD.name);
          return;
        }

        const profilePromise =
          supabase
            .from("profiles")
            .select(
              "full_name, household_name"
            )
            .eq("id", user.id)
            .maybeSingle();

        const householdPromise =
          householdId
            ? supabase
                .from("households")
                .select("name")
                .eq("id", householdId)
                .maybeSingle()
            : Promise.resolve({
                data: null,
                error: null,
              });

        let devicesQuery =
          applyHouseholdScope(
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
              ),
            householdId,
            user.id
          );

        const [
          profileResult,
          householdResult,
          devicesResult,
        ] = await Promise.all([
          profilePromise,
          householdPromise,
          devicesQuery,
        ]);

        if (profileResult.error) {
          console.error(
            "Unable to load home profile:",
            profileResult.error
          );
        }

        if (householdResult.error) {
          console.error(
            "Unable to load household:",
            householdResult.error
          );
        }

        if (devicesResult.error) {
          console.error(
            "Unable to load devices:",
            devicesResult.error
          );
          setDevices([]);
          setErrorMessage(
            "Unable to load your rooms."
          );
          return;
        }

        const sharedHouseholdName =
          householdResult.data?.name
            ?.trim();

        if (sharedHouseholdName) {
          setHouseholdName(
            sharedHouseholdName
          );
        } else {
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
        }

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
            .in(
              "device_id",
              deviceIds
            ),

          supabase
            .from(
              "device_documents"
            )
            .select("device_id")
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
    householdId,
    permissionsLoading,
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
    permissionsLoading ||
    loadingRooms;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
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
        <PageCard className="border-danger/30 bg-danger-soft text-danger">
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
      <PageHero
        section="technology"
        eyebrow={householdName}
        title="Your rooms."
        description="Browse your technology the same way you think about your home."
      >
        {canCreate ? (
          <Button
            href={getActionHref(
              "/devices/add",
              "devices"
            )}
          >
            <Plus size={17} />
            {getActionLabel("Add Device")}
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
        description="You can browse rooms and shared devices. Viewer access cannot add, edit, move, or delete room content."
      />

      {isDemo && (
        <section className="rounded-3xl border border-warning/40 bg-warning-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
            Premium Preview
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Explore how Home Tech
            Vault organizes an entire
            household by room.
          </p>
        </section>
      )}

      {devices.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
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
                placeholder="Search rooms or devices..."
                className="w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken py-3.5 pl-11 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:bg-surface-card focus:ring-4 focus:ring-interaction/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition hover:bg-surface-card hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <p className="shrink-0 text-sm text-text-secondary">
              {filteredRooms.length}{" "}
              {filteredRooms.length === 1
                ? "room"
                : "rooms"}
            </p>
          </div>
        </PageCard>
      )}

      {rooms.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Every room tells a story"
          description="Add your first device and assign it a room to begin seeing your home the way you live in it."
          section="technology"
        >
          {canCreate ? (
            <Button
              href={getActionHref(
                "/devices/add",
                "devices"
              )}
              className="mt-6"
            >
              <Plus size={17} aria-hidden />
              {getActionLabel(
                "Add your first device"
              )}
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
              You have viewer access. You can browse
              shared rooms, but you cannot add or change
              devices.
            </div>
          )}
        </EmptyState>
      ) : filteredRooms.length >
        0 ? (
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-overline text-charcoal-soft">
                Room by Room
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                Explore your home
              </h2>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
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
        <EmptyState
          icon={Search}
          title="No matching rooms"
          description="Try searching for a different room, device, brand, or category."
          section="technology"
        >
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() =>
              setSearchTerm("")
            }
          >
            Clear search
          </Button>
        </EmptyState>
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
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-warning/40 hover:shadow-[var(--shadow-md)]">
      <div className="relative bg-surface-sunken px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
            <Icon size={25} />
          </div>

          <RoomStatusBadge
            completeness={
              room.completeness
            }
          />
        </div>

        <h3 className="mt-7 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
          {room.name}
        </h3>

        <p className="mt-2 inline-flex items-center gap-2 text-sm text-text-secondary">
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
                <DeviceImageDisplay
                  device={{
                    id: device.id,
                    device_name:
                      device.deviceName,
                    brand: device.brand,
                    category:
                      device.category,
                  }}
                  variant="thumbnail"
                  className="!aspect-auto h-10 w-10 shrink-0 rounded-2xl"
                  imageClassName="!p-1.5"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {
                      device.deviceName
                    }
                  </p>

                  <p className="mt-0.5 truncate text-xs text-text-tertiary">
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
                  className="shrink-0 text-text-tertiary transition group-hover/device:translate-x-0.5 group-hover/device:text-text-primary"
                />
              </Link>
            )
          )}

          {remainingDevices > 0 && (
            <p className="pl-[52px] text-xs font-medium text-text-tertiary">
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

        <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-5">
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-achievement transition hover:text-text-primary"
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
      <span className="rounded-full bg-warning-soft px-3 py-1.5 text-xs font-semibold text-achievement">
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

function RoomMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-4">
      <p className="text-xs text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 truncate font-semibold text-text-primary">
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
  return (
    <FeatureGate
      feature="rooms"
      description="Organize your technology room by room, track protected value, and quickly see what is stored throughout your home."
    >
      <RoomsContent />
    </FeatureGate>
  );
}