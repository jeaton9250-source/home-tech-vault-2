"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CameraOff,
  FileQuestion,
  Laptop,
  Loader2,
  MapPin,
  ShieldCheck,
  Trophy,
  WalletCards,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
};

type DeviceIdRow = {
  device_id: string;
};

type ValueGroup = {
  label: string;
  value: number;
};

export default function ReportsPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [deviceIdsWithPhotos, setDeviceIdsWithPhotos] = useState<
    Set<string>
  >(new Set());
  const [deviceIdsWithDocuments, setDeviceIdsWithDocuments] = useState<
    Set<string>
  >(new Set());

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("Please sign in to view analytics.");
        }

        const { data: deviceData, error: deviceError } =
          await supabase
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
            .eq("user_id", user.id);

        if (deviceError) {
          throw deviceError;
        }

        const deviceRows = (deviceData || []) as DeviceRow[];
        setDevices(deviceRows);

        const deviceIds = deviceRows.map((device) => device.id);

        if (deviceIds.length === 0) {
          setDeviceIdsWithPhotos(new Set());
          setDeviceIdsWithDocuments(new Set());
          return;
        }

        const [photoResult, documentResult] = await Promise.all([
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

        if (photoResult.error) {
          console.error("Analytics photo error:", photoResult.error);
        }

        if (documentResult.error) {
          console.error(
            "Analytics document error:",
            documentResult.error
          );
        }

        setDeviceIdsWithPhotos(
          new Set(
            ((photoResult.data || []) as DeviceIdRow[]).map(
              (row) => row.device_id
            )
          )
        );

        setDeviceIdsWithDocuments(
          new Set(
            ((documentResult.data || []) as DeviceIdRow[]).map(
              (row) => row.device_id
            )
          )
        );
      } catch (error) {
        console.error("Analytics loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalValue = useMemo(
    () =>
      devices.reduce(
        (total, device) =>
          total + Number(device.purchase_price || 0),
        0
      ),
    [devices]
  );

  const activeWarrantyCount = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return devices.filter((device) => {
      if (!device.warranty_date) {
        return false;
      }

      const expiration = new Date(
        `${device.warranty_date}T23:59:59`
      );

      return expiration >= now;
    }).length;
  }, [devices]);

  const warrantyCoverageRate =
    devices.length === 0
      ? 0
      : Math.round(
          (activeWarrantyCount / devices.length) * 100
        );

  const missingPhotoCount = devices.filter(
    (device) => !deviceIdsWithPhotos.has(device.id)
  ).length;

  const missingDocumentCount = devices.filter(
    (device) => !deviceIdsWithDocuments.has(device.id)
  ).length;

  const valueByRoom = useMemo(
    () =>
      groupByValue(
        devices,
        (device) => device.location?.trim() || "Unassigned"
      ),
    [devices]
  );

  const valueByBrand = useMemo(
    () =>
      groupByValue(
        devices,
        (device) => device.brand?.trim() || "Unknown Brand"
      ),
    [devices]
  );

  const topDevices = useMemo(
    () =>
      [...devices]
        .sort(
          (a, b) =>
            Number(b.purchase_price || 0) -
            Number(a.purchase_price || 0)
        )
        .slice(0, 5),
    [devices]
  );

  return (
    <PageShell>
      <PageTitle
        eyebrow="Vault Intelligence"
        title="Technology Analytics"
        description="Understand the value, organization, and protection of the technology in your home."
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 className="animate-spin" size={22} />
            Loading analytics...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : devices.length === 0 ? (
        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <BarChart3 size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            No analytics yet
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Add devices and purchase values to begin building your
            technology analytics.
          </p>
        </PageCard>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsStat
              label="Protected Value"
              value={`$${totalValue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`}
              description="Total purchase value"
              icon={WalletCards}
            />

            <AnalyticsStat
              label="Devices"
              value={devices.length}
              description="Saved in your vault"
              icon={Laptop}
            />

            <AnalyticsStat
              label="Warranty Coverage"
              value={`${warrantyCoverageRate}%`}
              description={`${activeWarrantyCount} active warranties`}
              icon={ShieldCheck}
            />

            <AnalyticsStat
              label="Needs Attention"
              value={missingPhotoCount + missingDocumentCount}
              description="Missing photos or documents"
              icon={AlertTriangle}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ValueBreakdownCard
              title="Value by Room"
              description="Where your technology value is located."
              icon={MapPin}
              groups={valueByRoom}
              totalValue={totalValue}
            />

            <ValueBreakdownCard
              title="Value by Brand"
              description="Which brands make up your vault."
              icon={BarChart3}
              groups={valueByBrand}
              totalValue={totalValue}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PageCard>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <Trophy size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">
                    Most Valuable Devices
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Your highest-value technology.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {topDevices.map((device, index) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F5EF] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-[#111827] shadow-sm">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#111827]">
                          {device.device_name || "Unnamed Device"}
                        </p>

                        <p className="mt-1 truncate text-sm text-neutral-500">
                          {device.brand || "No brand"} ·{" "}
                          {device.location || "No location"}
                        </p>
                      </div>
                    </div>

                    <p className="whitespace-nowrap font-bold text-[#111827]">
                      $
                      {Number(
                        device.purchase_price || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">
                    Documentation Gaps
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Items that would improve your vault.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <GapRow
                  icon={CameraOff}
                  label="Devices missing photos"
                  value={missingPhotoCount}
                />

                <GapRow
                  icon={FileQuestion}
                  label="Devices missing documents"
                  value={missingDocumentCount}
                />

                <GapRow
                  icon={ShieldCheck}
                  label="Devices without active warranty"
                  value={devices.length - activeWarrantyCount}
                />
              </div>
            </PageCard>
          </section>
        </>
      )}
    </PageShell>
  );
}

function groupByValue(
  devices: DeviceRow[],
  getLabel: (device: DeviceRow) => string
): ValueGroup[] {
  const totals = new Map<string, number>();

  for (const device of devices) {
    const label = getLabel(device);
    const current = totals.get(label) || 0;

    totals.set(
      label,
      current + Number(device.purchase_price || 0)
    );
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({
      label,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

type AnalyticsStatProps = {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Laptop;
};

function AnalyticsStat({
  label,
  value,
  description,
  icon: Icon,
}: AnalyticsStatProps) {
  return (
    <PageCard className="p-6 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        {label}
      </p>

      <h2 className="mt-2 text-4xl font-bold text-[#111827]">
        {value}
      </h2>

      <p className="mt-2 text-sm text-neutral-400">
        {description}
      </p>
    </PageCard>
  );
}

type ValueBreakdownCardProps = {
  title: string;
  description: string;
  icon: typeof MapPin;
  groups: ValueGroup[];
  totalValue: number;
};

function ValueBreakdownCard({
  title,
  description,
  icon: Icon,
  groups,
  totalValue,
}: ValueBreakdownCardProps) {
  const largestValue = groups[0]?.value || 1;

  return (
    <PageCard>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {groups.slice(0, 8).map((group) => {
          const barWidth = Math.max(
            4,
            Math.round(
              (group.value / largestValue) * 100
            )
          );

          const percentOfTotal =
            totalValue === 0
              ? 0
              : Math.round(
                  (group.value / totalValue) * 100
                );

          return (
            <div key={group.label}>
              <div className="flex items-center justify-between gap-4">
                <p className="truncate font-semibold text-[#111827]">
                  {group.label}
                </p>

                <p className="whitespace-nowrap text-sm font-semibold text-neutral-600">
                  $
                  {group.value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  · {percentOfTotal}%
                </p>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EFECE5]">
                <div
                  className="h-full rounded-full bg-[#111827]"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageCard>
  );
}

type GapRowProps = {
  icon: typeof CameraOff;
  label: string;
  value: number;
};

function GapRow({
  icon: Icon,
  label,
  value,
}: GapRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F5EF] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#C8A96A] shadow-sm">
          <Icon size={19} />
        </div>

        <p className="font-semibold text-[#111827]">
          {label}
        </p>
      </div>

      <p className="text-2xl font-bold text-[#111827]">
        {value}
      </p>
    </div>
  );
}