"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  FileText,
  Laptop,
  Loader2,
  Plus,
  Radar,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  calculateVaultScore,
  type VaultDevice,
  type VaultScoreResult,
} from "@/lib/calculateVaultScore";

import {
  demoDashboard,
  demoDevices,
} from "@/lib/demoData";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  location: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  notes?: string | null;
};

type DashboardDevice = {
  id: string;
  device_name: string;
  brand: string;
  location: string;
  photo_url: string;
};

type WarrantyAlert = {
  id: string;
  device_name: string;
  warranty_date: string;
  days_remaining: number;
};

type ImageRow = {
  device_id: string;
  image_url: string;
};

type DocumentRow = {
  device_id: string;
};

type MaintenanceRow = {
  device_id: string;
};

const defaultVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

export default function DashboardPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [firstName, setFirstName] =
    useState("Homeowner");

  const [householdName, setHouseholdName] =
    useState("My Home Tech Vault");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [
    activeWarrantyCount,
    setActiveWarrantyCount,
  ] = useState(0);

  const [protectedValue, setProtectedValue] =
    useState(0);

  const [vaultScore, setVaultScore] =
    useState<VaultScoreResult>(
      defaultVaultScore
    );

  const [recentDevices, setRecentDevices] =
    useState<DashboardDevice[]>([]);

  const [warrantyAlerts, setWarrantyAlerts] =
    useState<WarrantyAlert[]>([]);

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingDashboard(true);
        setErrorMessage("");

        if (isDemo || !user) {
          loadDemoDashboard();
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
                location,
                category,
                serial_number,
                purchase_date,
                purchase_price,
                warranty_date,
                notes
              `
            )
            .eq("user_id", user.id),
        ]);

        if (profileResult.error) {
          console.error(
            "Unable to load dashboard profile:",
            profileResult.error
          );
        }

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        const profile =
          profileResult.data;

        const displayName =
          profile?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Homeowner";

        const resolvedFirstName =
          displayName.split(" ")[0];

        setFirstName(resolvedFirstName);

        setHouseholdName(
          profile?.household_name?.trim() ||
            `${resolvedFirstName}'s Home Tech Vault`
        );

        const deviceRows =
          (devicesResult.data ||
            []) as DeviceRow[];

        setDeviceCount(deviceRows.length);

        setProtectedValue(
          deviceRows.reduce(
            (total, device) =>
              total +
              Number(
                device.purchase_price || 0
              ),
            0
          )
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeWarranties =
          deviceRows.filter((device) => {
            if (!device.warranty_date) {
              return false;
            }

            const expiration = new Date(
              `${device.warranty_date}T23:59:59`
            );

            return expiration >= today;
          });

        setActiveWarrantyCount(
          activeWarranties.length
        );

        const upcomingWarranties =
          deviceRows
            .filter((device) =>
              Boolean(
                device.warranty_date
              )
            )
            .map((device) => {
              const expiration =
                new Date(
                  `${device.warranty_date}T23:59:59`
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

              return {
                id: device.id,
                device_name:
                  device.device_name ||
                  "Unnamed Device",
                warranty_date:
                  device.warranty_date ||
                  "",
                days_remaining:
                  daysRemaining,
              };
            })
            .filter(
              (device) =>
                device.days_remaining >=
                  0 &&
                device.days_remaining <=
                  60
            )
            .sort(
              (first, second) =>
                first.days_remaining -
                second.days_remaining
            )
            .slice(0, 4);

        setWarrantyAlerts(
          upcomingWarranties
        );

        const [
          documentsResult,
          maintenanceResult,
        ] = await Promise.all([
          supabase
            .from("device_documents")
            .select("device_id", {
              count: "exact",
            })
            .eq("user_id", user.id),

          supabase
            .from("device_events")
            .select("device_id")
            .eq("user_id", user.id)
            .in("event_type", [
              "Maintenance",
              "Repair",
              "Cleaning",
              "Software Update",
            ]),
        ]);

        if (documentsResult.error) {
          console.error(
            "Unable to load dashboard documents:",
            documentsResult.error
          );
        }

        if (maintenanceResult.error) {
          console.error(
            "Unable to load dashboard maintenance:",
            maintenanceResult.error
          );
        }

        setDocumentCount(
          documentsResult.count || 0
        );

        const firstImageByDevice =
          new Map<string, string>();

        const deviceIdsWithPhotos =
          new Set<string>();

        if (deviceRows.length > 0) {
          const deviceIds =
            deviceRows.map(
              (device) => device.id
            );

          const {
            data: imageRows,
            error: imageError,
          } = await supabase
            .from("device_images")
            .select(
              "device_id, image_url"
            )
            .eq("user_id", user.id)
            .in("device_id", deviceIds)
            .order("created_at", {
              ascending: true,
            });

          if (imageError) {
            console.error(
              "Unable to load dashboard images:",
              imageError
            );
          }

          for (const image of
            (imageRows ||
              []) as ImageRow[]) {
            deviceIdsWithPhotos.add(
              image.device_id
            );

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
        }

        const latestDevices = [
          ...deviceRows,
        ]
          .reverse()
          .slice(0, 4);

        const resolvedRecentDevices =
          await Promise.all(
            latestDevices.map(
              async (device) => {
                const imagePath =
                  firstImageByDevice.get(
                    device.id
                  );

                if (!imagePath) {
                  return {
                    id: device.id,
                    device_name:
                      device.device_name ||
                      "Unnamed Device",
                    brand:
                      device.brand || "",
                    location:
                      device.location || "",
                    photo_url: "",
                  };
                }

                const {
                  data: signedData,
                  error: signedError,
                } = await supabase.storage
                  .from("device-images")
                  .createSignedUrl(
                    imagePath,
                    3600
                  );

                if (signedError) {
                  console.error(
                    "Unable to create device image URL:",
                    signedError
                  );
                }

                return {
                  id: device.id,
                  device_name:
                    device.device_name ||
                    "Unnamed Device",
                  brand:
                    device.brand || "",
                  location:
                    device.location || "",
                  photo_url:
                    signedData?.signedUrl ||
                    "",
                };
              }
            )
          );

        setRecentDevices(
          resolvedRecentDevices
        );

        const vaultDevices: VaultDevice[] =
          deviceRows.map((device) => ({
            id: device.id,
            device_name:
              device.device_name || "",
            brand: device.brand || "",
            category:
              device.category || "",
            serial_number:
              device.serial_number || "",
            purchase_date:
              device.purchase_date || "",
            warranty_date:
              device.warranty_date || "",
            purchase_price:
              device.purchase_price || 0,
            location:
              device.location || "",
            notes:
              device.notes || "",
          }));

        const deviceIdsWithDocuments =
          new Set(
            (
              (documentsResult.data ||
                []) as DocumentRow[]
            ).map(
              (document) =>
                document.device_id
            )
          );

        const deviceIdsWithMaintenance =
          new Set(
            (
              (maintenanceResult.data ||
                []) as MaintenanceRow[]
            ).map(
              (maintenance) =>
                maintenance.device_id
            )
          );

        const calculatedScore =
          calculateVaultScore({
            devices: vaultDevices,
            deviceIdsWithPhotos,
            deviceIdsWithDocuments,
            deviceIdsWithMaintenance,
          });

        setVaultScore(calculatedScore);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoadingDashboard(false);
      }
    }

    function loadDemoDashboard() {
      setFirstName(
        demoDashboard.firstName
      );

      setHouseholdName(
        demoDashboard.householdName
      );

      setDeviceCount(
        demoDashboard.deviceCount
      );

      setDocumentCount(
        demoDashboard.documentCount
      );

      setActiveWarrantyCount(
        demoDashboard.activeWarrantyCount
      );

      setProtectedValue(
        demoDashboard.protectedValue
      );

      setRecentDevices(
        demoDevices
          .slice(0, 4)
          .map((device) => ({
            id: device.id,
            device_name:
              device.device_name,
            brand:
              device.brand || "",
            location:
              device.location || "",
            photo_url:
              device.photo_url || "",
          }))
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setWarrantyAlerts(
        demoDevices
          .filter((device) =>
            Boolean(
              device.warranty_date
            )
          )
          .map((device) => {
            const expiration =
              new Date(
                `${device.warranty_date}T23:59:59`
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

            return {
              id: device.id,
              device_name:
                device.device_name,
              warranty_date:
                device.warranty_date,
              days_remaining:
                daysRemaining,
            };
          })
          .filter(
            (device) =>
              device.days_remaining >= 0 &&
              device.days_remaining <=
                365
          )
          .sort(
            (first, second) =>
              first.days_remaining -
              second.days_remaining
          )
          .slice(0, 4)
      );

      setVaultScore({
        total: 92,
        protection: 94,
        organization: 96,
        documentation: 88,
        maintenance: 90,
        label: "Excellent",
        recommendations: [
          "Upload the missing printer receipt.",
          "Complete the upcoming router firmware update.",
        ],
      });
    }

    loadDashboard();
  }, [
    user,
    isDemo,
    demoLoading,
  ]);

  const loading =
    demoLoading ||
    loadingDashboard;

  const greeting = useMemo(() => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  const primaryInsight =
    vaultScore.recommendations[0] ||
    (deviceCount === 0
      ? "Add your first device to begin building your vault."
      : "Your technology records are looking organized.");

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading your vault...
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
            Unable to load dashboard
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
      <section className="rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm md:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              {greeting}, {firstName}
            </p>

            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
              Everything at home,
              organized.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-500">
              {householdName}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="/devices/add"
              variant="secondary"
            >
              <Plus size={17} />
              Add Device
            </Button>

            <Button href="/network/discover">
              <Radar size={17} />
              Scan Network
            </Button>
          </div>
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            You are exploring a sample household.
            Create an account to organize your own
            devices and documents.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MinimalStatCard
          label="Devices"
          value={deviceCount.toLocaleString()}
          icon={Laptop}
        />

        <MinimalStatCard
          label="Protected Value"
          value={formatCurrency(
            protectedValue
          )}
          icon={WalletCards}
        />

        <MinimalStatCard
          label="Documents"
          value={documentCount.toLocaleString()}
          icon={FileText}
        />

        <MinimalStatCard
          label="Active Warranties"
          value={activeWarrantyCount.toLocaleString()}
          icon={ShieldCheck}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <PageCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Vault Health
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">
                {vaultScore.label}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
              {vaultScore.total}
            </div>
          </div>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
            <div
              className="h-full rounded-full bg-[#111827] transition-all"
              style={{
                width: `${Math.min(
                  vaultScore.total,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <ScoreMetric
              label="Protection"
              value={
                vaultScore.protection
              }
            />

            <ScoreMetric
              label="Organization"
              value={
                vaultScore.organization
              }
            />

            <ScoreMetric
              label="Documents"
              value={
                vaultScore.documentation
              }
            />

            <ScoreMetric
              label="Maintenance"
              value={
                vaultScore.maintenance
              }
            />
          </div>
        </PageCard>

        <PageCard className="bg-[#111827] text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Smart Insight
              </p>

              <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.02em]">
                {primaryInsight}
              </h2>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
              <Sparkles size={21} />
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/60">
            Keep your records complete to improve
            your vault health and make insurance,
            warranty, and maintenance information
            easier to find.
          </p>

          <Button
            href="/insights"
            variant="secondary"
            className="mt-7"
          >
            View Insights
            <ArrowRight size={16} />
          </Button>
        </PageCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <PageCard>
          <SectionHeader
            eyebrow="Recently Added"
            title="Your latest devices"
            actionHref="/devices"
            actionLabel="View all"
          />

          {recentDevices.length === 0 ? (
            <EmptyState
              icon={Laptop}
              title="No devices yet"
              description="Add your first device to begin building your home technology inventory."
              href="/devices/add"
              buttonLabel="Add Device"
            />
          ) : (
            <div className="mt-6 divide-y divide-[#E8E2D6]">
              {recentDevices.map(
                (device) => (
                  <a
                    key={device.id}
                    href={`/devices/${device.id}`}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {device.photo_url ? (
                      <img
                        src={
                          device.photo_url
                        }
                        alt={
                          device.device_name
                        }
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                        <Laptop size={22} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#111827]">
                        {
                          device.device_name
                        }
                      </p>

                      <p className="mt-1 truncate text-sm text-neutral-500">
                        {[
                          device.brand,
                          device.location,
                        ]
                          .filter(Boolean)
                          .join(" · ") ||
                          "Device details"}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-neutral-400"
                    />
                  </a>
                )
              )}
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader
            eyebrow="Quick Actions"
            title="Shortcuts"
          />

          <div className="mt-6 space-y-2">
            <QuickAction
              href="/devices/add"
              icon={Plus}
              label="Add a device"
            />

            <QuickAction
              href="/documents/upload"
              icon={FileText}
              label="Upload a document"
            />

            <QuickAction
              href="/network/discover"
              icon={Radar}
              label="Scan your network"
            />

            <QuickAction
              href="/maintenance"
              icon={Wrench}
              label="Review maintenance"
            />
          </div>
        </PageCard>
      </section>

      <PageCard>
        <SectionHeader
          eyebrow="Warranty Watch"
          title="Upcoming expirations"
          actionHref="/warranties"
          actionLabel="View warranties"
        />

        {warrantyAlerts.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
            No warranties expire within the next
            60 days.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {warrantyAlerts.map(
              (warranty) => (
                <a
                  key={warranty.id}
                  href={`/devices/${warranty.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8E2D6] p-4 transition hover:border-[#C8A96A]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">
                      {
                        warranty.device_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      Expires{" "}
                      {formatDate(
                        warranty.warranty_date
                      )}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#F3EAD7] px-3 py-1.5 text-xs font-semibold text-[#8A6A2F]">
                    {warranty.days_remaining ===
                    0
                      ? "Today"
                      : `${warranty.days_remaining} days`}
                  </span>
                </a>
              )
            )}
          </div>
        )}
      </PageCard>
    </PageShell>
  );
}

function MinimalStatCard({
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
        <div>
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={21} />
        </div>
      </div>
    </PageCard>
  );
}

function ScoreMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#111827]">
          {title}
        </h2>
      </div>

      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="text-sm font-semibold text-neutral-500 transition hover:text-[#111827]"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Laptop;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#F7F5EF]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={18} />
      </div>

      <span className="flex-1 text-sm font-semibold text-[#111827]">
        {label}
      </span>

      <ArrowRight
        size={16}
        className="text-neutral-400"
      />
    </a>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  buttonLabel,
}: {
  icon: typeof Laptop;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}) {
  return (
    <div className="mt-6 rounded-3xl bg-[#F7F5EF] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#C8A96A]">
        <Icon size={25} />
      </div>

      <h3 className="mt-4 text-xl font-semibold text-[#111827]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <Button
        href={href}
        className="mt-5"
      >
        {buttonLabel}
      </Button>
    </div>
  );
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

function formatDate(
  value: string
) {
  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}