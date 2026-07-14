"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle2,
  ChefHat,
  CircleAlert,
  FileText,
  Gamepad2,
  Home,
  Laptop,
  Loader2,
  Monitor,
  Plus,
  ShieldCheck,
  Sofa,
  Sparkles,
  Trees,
  Warehouse,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PremiumGate from "@/components/PremiumGate";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
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
  documentedCount: number;
  photoCount: number;
  expiringWarrantyCount: number;
  completeness: number;
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

function MyHomeContent() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [devices, setDevices] =
    useState<HomeDevice[]>([]);

  const [householdName, setHouseholdName] =
    useState("My Home");

  const [loadingHome, setLoadingHome] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadHome() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingHome(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices(demoHomeDevices);
          setHouseholdName("The Demo Household");
          return;
        }

        const [profileResult, devicesResult] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, household_name")
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
          profileResult.data?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Homeowner";

        const firstName =
          displayName.split(" ")[0];

        setHouseholdName(
          profileResult.data?.household_name?.trim() ||
            `${firstName}'s Home`
        );

        const deviceRows =
          (devicesResult.data || []) as DeviceRow[];

        if (deviceRows.length === 0) {
          setDevices([]);
          return;
        }

        const deviceIds = deviceRows.map(
          (device) => device.id
        );

        const [imageResult, documentResult] =
          await Promise.all([
            supabase
              .from("device_images")
              .select("device_id")
              .eq("user_id", user.id)
              .in("device_id", deviceIds),

            supabase
              .from("device_documents")
              .select("device_id")
              .eq("user_id", user.id)
              .in("device_id", deviceIds),
          ]);

        if (imageResult.error) {
          console.error(
            "Unable to load home photos:",
            imageResult.error
          );
        }

        if (documentResult.error) {
          console.error(
            "Unable to load home documents:",
            documentResult.error
          );
        }

        const deviceIdsWithPhotos = new Set(
          (
            (imageResult.data ||
              []) as DeviceReferenceRow[]
          ).map((row) => row.device_id)
        );

        const deviceIdsWithDocuments = new Set(
          (
            (documentResult.data ||
              []) as DeviceReferenceRow[]
          ).map((row) => row.device_id)
        );

        setDevices(
          deviceRows.map((device) => ({
            id: device.id,
            deviceName:
              device.device_name ||
              "Unnamed Device",
            brand: device.brand || "",
            category: device.category || "",
            location:
              device.location?.trim() ||
              "Unassigned",
            purchasePrice: Number(
              device.purchase_price || 0
            ),
            warrantyDate:
              device.warranty_date || "",
            hasPhoto:
              deviceIdsWithPhotos.has(device.id),
            hasDocument:
              deviceIdsWithDocuments.has(
                device.id
              ),
          }))
        );
      } catch (error) {
        console.error(
          "My Home loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your home."
        );
      } finally {
        setLoadingHome(false);
      }
    }

    loadHome();
  }, [user, isDemo, demoLoading]);

  const rooms = useMemo(() => {
    const groupedRooms =
      new Map<string, HomeDevice[]>();

    for (const device of devices) {
      const roomName =
        device.location.trim() || "Unassigned";

      const roomDevices =
        groupedRooms.get(roomName) || [];

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
      .map(([name, roomDevices]) => {
        const documentedCount =
          roomDevices.filter(
            (device) => device.hasDocument
          ).length;

        const photoCount =
          roomDevices.filter(
            (device) => device.hasPhoto
          ).length;

        const possibleItems =
          roomDevices.length * 2;

        const completeness =
          possibleItems === 0
            ? 0
            : Math.round(
                ((documentedCount +
                  photoCount) /
                  possibleItems) *
                  100
              );

        const expiringWarrantyCount =
          roomDevices.filter((device) => {
            if (!device.warrantyDate) {
              return false;
            }

            const expiration = new Date(
              `${device.warrantyDate}T23:59:59`
            );

            const daysRemaining = Math.ceil(
              (expiration.getTime() -
                today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              daysRemaining >= 0 &&
              daysRemaining <= 90
            );
          }).length;

        return {
          name,
          devices: roomDevices,
          deviceCount: roomDevices.length,
          protectedValue:
            roomDevices.reduce(
              (total, device) =>
                total +
                device.purchasePrice,
              0
            ),
          documentedCount,
          photoCount,
          expiringWarrantyCount,
          completeness,
        } satisfies RoomSummary;
      })
      .sort(
        (first, second) =>
          second.protectedValue -
          first.protectedValue
      );
  }, [devices]);

  const totalProtectedValue =
    devices.reduce(
      (total, device) =>
        total + device.purchasePrice,
      0
    );

  const overallDocumentation =
    devices.length === 0
      ? 0
      : Math.round(
          (devices.filter(
            (device) => device.hasDocument
          ).length /
            devices.length) *
            100
        );

  const photoCoverage =
    devices.length === 0
      ? 0
      : Math.round(
          (devices.filter(
            (device) => device.hasPhoto
          ).length /
            devices.length) *
            100
        );

  const averageRoomCompleteness =
    rooms.length === 0
      ? 0
      : Math.round(
          rooms.reduce(
            (total, room) =>
              total + room.completeness,
            0
          ) / rooms.length
        );

  const healthiestRoom =
    [...rooms].sort(
      (first, second) =>
        second.completeness -
        first.completeness
    )[0] || null;

  const highestValueRoom =
    rooms[0] || null;

  const roomNeedingAttention =
    [...rooms].sort(
      (first, second) =>
        first.completeness -
        second.completeness
    )[0] || null;

  const expiringWarrantyTotal =
    rooms.reduce(
      (total, room) =>
        total +
        room.expiringWarrantyCount,
      0
    );

  const loading =
    demoLoading || loadingHome;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Building your home view...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-xl font-bold">
            Unable to load My Home
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
      <PageTitle
        eyebrow="Digital Home"
        title="My Home"
        description="Explore your technology, protected value, and documentation room by room."
        action={
          <Button
            href={
              isDemo
                ? "/signup"
                : "/devices/add"
            }
          >
            <Plus size={18} />

            {isDemo
              ? "Create Your Vault"
              : "Add Device"}
          </Button>
        }
      />

      {isDemo && (
        <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Premium Preview
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Explore how Home Tech Vault
            organizes an entire household by
            room.
          </p>
        </PageCard>
      )}

      <section className="rounded-[36px] border border-[#E8E2D6] bg-white p-7 shadow-sm md:p-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
              <Home size={27} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Household Overview
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
              {householdName}
            </h1>

            <p className="mt-4 max-w-xl leading-7 text-neutral-500">
              Every device in your home,
              beautifully organized by room.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <HeroMetric
              label="Rooms"
              value={rooms.length}
            />

            <HeroMetric
              label="Devices"
              value={devices.length}
            />

            <HeroMetric
              label="Value"
              value={formatCompactCurrency(
                totalProtectedValue
              )}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HomeStat
          label="Rooms"
          value={rooms.length.toLocaleString()}
          description="Technology locations"
          icon={Building2}
        />

        <HomeStat
          label="Devices"
          value={devices.length.toLocaleString()}
          description="Across your home"
          icon={Laptop}
        />

        <HomeStat
          label="Protected Value"
          value={formatCurrency(
            totalProtectedValue
          )}
          description="Recorded purchase value"
          icon={ShieldCheck}
        />

        <HomeStat
          label="Documentation"
          value={`${overallDocumentation}%`}
          description="Devices with files"
          icon={FileText}
        />
      </section>

      {rooms.length === 0 ? (
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Home size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-[#111827]">
            Your home is ready
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Add devices and assign each one a
            room to build your personalized home
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
            <Plus size={18} />
            Add Your First Device
          </Button>
        </PageCard>
      ) : (
        <>
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                  Room by Room
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
                  Explore your home
                </h2>
              </div>

              <p className="text-sm text-neutral-500">
                Ordered by protected value
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.name}
                  room={room}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageCard>
              <SectionHeading
                eyebrow="Home Health"
                title="Protection overview"
                description="See how complete your household records are."
              />

              <div className="mt-7 space-y-6">
                <HealthRow
                  label="Document coverage"
                  value={
                    overallDocumentation
                  }
                />

                <HealthRow
                  label="Photo coverage"
                  value={photoCoverage}
                />

                <HealthRow
                  label="Room completeness"
                  value={
                    averageRoomCompleteness
                  }
                />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <SummaryTile
                  label="Expiring Warranties"
                  value={
                    expiringWarrantyTotal
                  }
                />

                <SummaryTile
                  label="Complete Rooms"
                  value={
                    rooms.filter(
                      (room) =>
                        room.completeness ===
                        100
                    ).length
                  }
                />
              </div>
            </PageCard>

            <PageCard className="bg-[#111827] text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Home Insights
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    What stands out
                  </h2>
                </div>

                <Sparkles
                  size={22}
                  className="text-[#C8A96A]"
                />
              </div>

              <div className="mt-7 space-y-5">
                {highestValueRoom && (
                  <InsightRow
                    icon={ShieldCheck}
                    title={`${highestValueRoom.name} holds the most value`}
                    description={`${formatCurrency(
                      highestValueRoom.protectedValue
                    )} across ${
                      highestValueRoom.deviceCount
                    } devices.`}
                  />
                )}

                {healthiestRoom && (
                  <InsightRow
                    icon={CheckCircle2}
                    title={`${healthiestRoom.name} is most complete`}
                    description={`${healthiestRoom.completeness}% photo and document coverage.`}
                  />
                )}

                {roomNeedingAttention &&
                  roomNeedingAttention.completeness <
                    100 && (
                    <InsightRow
                      icon={CircleAlert}
                      title={`${roomNeedingAttention.name} needs attention`}
                      description={`Coverage is currently ${roomNeedingAttention.completeness}%.`}
                    />
                  )}
              </div>
            </PageCard>
          </section>
        </>
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
    <article className="group rounded-[28px] border border-[#E8E2D6] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8A96A] hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={23} />
        </div>

        <span className="rounded-full bg-[#F7F5EF] px-3 py-1.5 text-xs font-semibold text-neutral-600">
          {room.completeness}% complete
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">
        {room.name}
      </h3>

      <p className="mt-2 text-sm text-neutral-500">
        {room.deviceCount} device
        {room.deviceCount === 1
          ? ""
          : "s"}
      </p>

      <div className="mt-5 space-y-3">
        {previewDevices.map(
          (device) => (
            <div
              key={device.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {device.deviceName}
                </p>

                <p className="mt-1 truncate text-xs text-neutral-400">
                  {device.brand ||
                    device.category ||
                    "Device"}
                </p>
              </div>

              {device.hasDocument &&
              device.hasPhoto ? (
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-emerald-600"
                />
              ) : (
                <CircleAlert
                  size={16}
                  className="shrink-0 text-amber-600"
                />
              )}
            </div>
          )
        )}

        {remainingDevices > 0 && (
          <p className="text-sm text-neutral-400">
            +{remainingDevices} more
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-[#E8E2D6] pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Protected Value
            </p>

            <p className="mt-1 text-xl font-semibold text-[#111827]">
              {formatCurrency(
                room.protectedValue
              )}
            </p>
          </div>

          <a
            href={`/devices?search=${encodeURIComponent(
              room.name
            )}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]"
          >
            View Room
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-24 rounded-2xl bg-[#F7F5EF] p-4 text-center">
      <p className="text-2xl font-semibold text-[#111827]">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-500">
        {label}
      </p>
    </div>
  );
}

function HomeStat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: RoomIcon;
}) {
  return (
    <PageCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={19} />
        </div>
      </div>
    </PageCard>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.min(
    Math.max(value, 0),
    100
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {label}
        </p>

        <p className="text-sm font-semibold text-[#111827]">
          {safeValue}%
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
        <div
          className="h-full rounded-full bg-[#111827]"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  title,
  description,
}: {
  icon: RoomIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#C8A96A]">
        <Icon size={17} />
      </div>

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-white/55">
          {description}
        </p>
      </div>
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

  if (room.includes("unassigned")) {
    return CircleAlert;
  }

  return Home;
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatCompactCurrency(
  value: number
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function HomePage() {
  const {
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  if (demoModeLoading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading My Home...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  // Demo visitors can preview the premium page.
  if (isDemo) {
    return <MyHomeContent />;
  }

  // Signed-in users must have premium access.
  return (
    <PremiumGate
      feature="My Home"
      description="Organize your technology room by room, track protected value, and view household-wide insights."
    >
      <MyHomeContent />
    </PremiumGate>
  );
}