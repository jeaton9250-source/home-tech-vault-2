"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Crown,
  FileText,
  Laptop,
  Loader2,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  demoDevices,
  demoDocuments,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useSubscription } from "@/hooks/useSubscription";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceRecord = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  warranty_date: string | null;
  serial_number: string | null;
  notes: string | null;
};

type DocumentRecord = {
  id: string;
  device_id: string | null;
  file_type?: string | null;
  document_type?: string | null;
};

type SubscriptionRecord = {
  id: string;
  service_name: string | null;
  monthly_cost: number | null;
};

type MaintenanceRecord = {
  id: string;
  device_id: string | null;
  status: string | null;
  due_date: string | null;
};

type BreakdownItem = {
  label: string;
  value: number;
  count: number;
};

export default function InsightsPage() {
  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const {
    canUsePremiumFeatures,
    isAdmin,
    loading: subscriptionLoading,
  } = useSubscription();

  const [devices, setDevices] =
    useState<DeviceRecord[]>([]);

  const [documents, setDocuments] =
    useState<DocumentRecord[]>([]);

  const [subscriptions, setSubscriptions] =
    useState<SubscriptionRecord[]>([]);

  const [maintenance, setMaintenance] =
    useState<MaintenanceRecord[]>([]);

  const [loadingInsights, setLoadingInsights] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadInsights() {
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingInsights(true);
        setErrorMessage("");

        if (isDemo) {
          setDevices(
            demoDevices.map((device) => ({
              id: device.id,
              device_name: device.device_name,
              brand: device.brand,
              category: device.category,
              location: device.location,
              purchase_price: device.purchase_price,
              purchase_date: device.purchase_date,
              warranty_date: device.warranty_date,
              serial_number: device.serial_number,
              notes: device.notes,
            }))
          );

          setDocuments(
            demoDocuments.map((document) => ({
              id: document.id,
              device_id: document.device_id,
              document_type:
                document.document_type,
            }))
          );

          setSubscriptions(
            demoSubscriptions.map((subscription) => ({
              id: subscription.id,
              service_name:
                subscription.service_name,
              monthly_cost:
                subscription.monthly_cost,
            }))
          );

          setMaintenance(
            demoMaintenance.map((item) => ({
              id: item.id,
              device_id: item.device_id,
              status: item.status,
              due_date: item.due_date,
            }))
          );

          return;
        }

        if (!user) {
          setDevices([]);
          setDocuments([]);
          setSubscriptions([]);
          setMaintenance([]);
          return;
        }

        const [
          deviceResult,
          documentResult,
          subscriptionResult,
          maintenanceResult,
        ] = await Promise.all([
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
                purchase_date,
                warranty_date,
                serial_number,
                notes
              `
            )
            .eq("user_id", user.id),

          supabase
            .from("device_documents")
            .select(
              "id, device_id, document_type"
            )
            .eq("user_id", user.id),

          supabase
            .from("subscriptions")
            .select(
              "id, service_name, monthly_cost"
            )
            .eq("user_id", user.id),

          supabase
            .from("maintenance_tasks")
            .select(
              "id, device_id, status, due_date"
            )
            .eq("user_id", user.id),
        ]);

        if (deviceResult.error) {
          throw deviceResult.error;
        }

        if (documentResult.error) {
          console.error(
            "Unable to load insight documents:",
            documentResult.error
          );
        }

        if (subscriptionResult.error) {
          console.error(
            "Unable to load insight subscriptions:",
            subscriptionResult.error
          );
        }

        if (maintenanceResult.error) {
          console.error(
            "Unable to load insight maintenance:",
            maintenanceResult.error
          );
        }

        setDevices(
          (deviceResult.data ||
            []) as DeviceRecord[]
        );

        setDocuments(
          (documentResult.data ||
            []) as DocumentRecord[]
        );

        setSubscriptions(
          (subscriptionResult.data ||
            []) as SubscriptionRecord[]
        );

        setMaintenance(
          (maintenanceResult.data ||
            []) as MaintenanceRecord[]
        );
      } catch (error) {
        console.error(
          "Unable to load Vault Insights:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load Vault Insights."
        );
      } finally {
        setLoadingInsights(false);
      }
    }

    loadInsights();
  }, [
    user,
    isDemo,
    demoModeLoading,
  ]);

  const totalValue = useMemo(
    () =>
      devices.reduce(
        (total, device) =>
          total +
          Number(device.purchase_price || 0),
        0
      ),
    [devices]
  );

  const monthlySubscriptions = useMemo(
    () =>
      subscriptions.reduce(
        (total, subscription) =>
          total +
          Number(
            subscription.monthly_cost || 0
          ),
        0
      ),
    [subscriptions]
  );

  const roomBreakdown = useMemo(
    () =>
      createBreakdown(
        devices,
        (device) =>
          device.location?.trim() ||
          "Unassigned"
      ),
    [devices]
  );

  const brandBreakdown = useMemo(
    () =>
      createBreakdown(
        devices,
        (device) =>
          device.brand?.trim() ||
          "Unknown Brand"
      ),
    [devices]
  );

  const warrantyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let missing = 0;

    for (const device of devices) {
      if (!device.warranty_date) {
        missing += 1;
        continue;
      }

      const expiration = new Date(
        `${device.warranty_date}T23:59:59`
      );

      const daysRemaining = Math.ceil(
        (expiration.getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysRemaining < 0) {
        expired += 1;
      } else if (daysRemaining <= 60) {
        active += 1;
        expiringSoon += 1;
      } else {
        active += 1;
      }
    }

    return {
      active,
      expiringSoon,
      expired,
      missing,
    };
  }, [devices]);

  const deviceIdsWithDocuments = useMemo(
    () =>
      new Set(
        documents
          .map((document) => document.device_id)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      ),
    [documents]
  );

  const devicesWithSerialNumbers =
    useMemo(
      () =>
        devices.filter((device) =>
          Boolean(device.serial_number?.trim())
        ).length,
      [devices]
    );

  const documentedDevices =
    deviceIdsWithDocuments.size;

  const documentationPercentage =
    devices.length > 0
      ? Math.round(
          (documentedDevices /
            devices.length) *
            100
        )
      : 0;

  const serialPercentage =
    devices.length > 0
      ? Math.round(
          (devicesWithSerialNumbers /
            devices.length) *
            100
        )
      : 0;

  const agingDevices = useMemo(() => {
    const today = new Date();

    return devices
      .filter((device) =>
        Boolean(device.purchase_date)
      )
      .map((device) => {
        const purchaseDate = new Date(
          `${device.purchase_date}T00:00:00`
        );

        const ageInYears =
          (today.getTime() -
            purchaseDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);

        return {
          ...device,
          ageInYears,
        };
      })
      .filter(
        (device) => device.ageInYears >= 4
      )
      .sort(
        (first, second) =>
          second.ageInYears -
          first.ageInYears
      )
      .slice(0, 5);
  }, [devices]);

  const averageDeviceAge = useMemo(() => {
    const today = new Date();

    const ages = devices
      .filter((device) =>
        Boolean(device.purchase_date)
      )
      .map((device) => {
        const purchaseDate = new Date(
          `${device.purchase_date}T00:00:00`
        );

        return (
          (today.getTime() -
            purchaseDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
        );
      })
      .filter(
        (age) =>
          Number.isFinite(age) && age >= 0
      );

    if (ages.length === 0) {
      return 0;
    }

    return (
      ages.reduce(
        (total, age) => total + age,
        0
      ) / ages.length
    );
  }, [devices]);

  const dueMaintenanceCount = useMemo(
    () =>
      maintenance.filter((item) => {
        const status =
          item.status?.toLowerCase() || "";

        return (
          status.includes("due") ||
          status.includes("overdue")
        );
      }).length,
    [maintenance]
  );

  const recommendationItems = useMemo(() => {
    const recommendations: string[] = [];

    const missingDocuments =
      devices.length - documentedDevices;

    const missingSerials =
      devices.length -
      devicesWithSerialNumbers;

    if (missingDocuments > 0) {
      recommendations.push(
        `Upload documents for ${missingDocuments} device${
          missingDocuments === 1 ? "" : "s"
        }.`
      );
    }

    if (missingSerials > 0) {
      recommendations.push(
        `Add serial numbers to ${missingSerials} device${
          missingSerials === 1 ? "" : "s"
        }.`
      );
    }

    if (warrantyStats.expiringSoon > 0) {
      recommendations.push(
        `${warrantyStats.expiringSoon} warranty${
          warrantyStats.expiringSoon === 1
            ? ""
            : "ies"
        } expire within 60 days.`
      );
    }

    if (dueMaintenanceCount > 0) {
      recommendations.push(
        `Complete ${dueMaintenanceCount} maintenance task${
          dueMaintenanceCount === 1
            ? ""
            : "s"
        }.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Your vault is well organized. Keep device information current."
      );
    }

    return recommendations.slice(0, 4);
  }, [
    devices,
    documentedDevices,
    devicesWithSerialNumbers,
    warrantyStats.expiringSoon,
    dueMaintenanceCount,
  ]);

  const loading =
    demoModeLoading ||
    subscriptionLoading ||
    loadingInsights;

  const premiumUnlocked =
    isDemo ||
    isAdmin ||
    canUsePremiumFeatures;

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Analyzing your vault...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Premium Analytics"
        title="Vault Insights"
        description="Understand the value, organization, coverage, and health of your home technology."
        action={
          !premiumUnlocked ? (
            <Button href="/upgrade">
              <Crown size={18} />
              Unlock Insights
            </Button>
          ) : undefined
        }
      />

      {isDemo && (
        <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#C8A96A]">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
                Interactive Demo
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#111827]">
                Explore sample household insights
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                These insights are calculated from the
                sample devices, subscriptions, documents,
                warranties, and maintenance tasks.
              </p>
            </div>
          </div>
        </PageCard>
      )}

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <InsightStat
          label="Protected Value"
          value={formatCurrency(totalValue)}
          description="Recorded device purchase value"
          icon={WalletCards}
        />

        <InsightStat
          label="Devices"
          value={devices.length.toString()}
          description={`${roomBreakdown.length} documented location${
            roomBreakdown.length === 1
              ? ""
              : "s"
          }`}
          icon={Laptop}
        />

        <InsightStat
          label="Documents"
          value={documents.length.toString()}
          description={`${documentationPercentage}% of devices documented`}
          icon={FileText}
        />

        <InsightStat
          label="Average Age"
          value={
            averageDeviceAge > 0
              ? `${averageDeviceAge.toFixed(1)} yrs`
              : "Not available"
          }
          description="Based on purchase dates"
          icon={BarChart3}
        />
      </section>

      {!premiumUnlocked ? (
        <PremiumInsightsLock
          deviceCount={devices.length}
          totalValue={totalValue}
        />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <BreakdownCard
              eyebrow="Room Analysis"
              title="Technology value by room"
              items={roomBreakdown}
              emptyMessage="Add device locations to see room insights."
            />

            <BreakdownCard
              eyebrow="Brand Analysis"
              title="Technology value by brand"
              items={brandBreakdown}
              emptyMessage="Add device brands to see brand insights."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PageCard>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Warranty Health
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                Coverage overview
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MiniStat
                  label="Active"
                  value={warrantyStats.active}
                />

                <MiniStat
                  label="Expiring Soon"
                  value={warrantyStats.expiringSoon}
                />

                <MiniStat
                  label="Expired"
                  value={warrantyStats.expired}
                />

                <MiniStat
                  label="Missing"
                  value={warrantyStats.missing}
                />
              </div>
            </PageCard>

            <PageCard>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Documentation Health
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                Inventory completeness
              </h2>

              <div className="mt-6 space-y-5">
                <ProgressMetric
                  label="Devices with documents"
                  value={documentedDevices}
                  total={devices.length}
                />

                <ProgressMetric
                  label="Devices with serial numbers"
                  value={devicesWithSerialNumbers}
                  total={devices.length}
                />

                <ProgressMetric
                  label="Documentation score"
                  value={documentationPercentage}
                  total={100}
                  suffix="%"
                />

                <ProgressMetric
                  label="Serial number score"
                  value={serialPercentage}
                  total={100}
                  suffix="%"
                />
              </div>
            </PageCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <PageCard>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Smart Recommendations
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#111827]">
                    Improve your vault
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recommendationItems.map(
                  (recommendation) => (
                    <div
                      key={recommendation}
                      className="flex items-start gap-3 rounded-2xl bg-[#F7F5EF] p-4"
                    >
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#C8A96A]"
                      />

                      <p className="text-sm leading-6 text-[#111827]">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </PageCard>

            <PageCard>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Subscription Spending
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                Recurring technology costs
              </h2>

              <div className="mt-6 rounded-3xl bg-[#111827] p-6 text-white">
                <p className="text-sm text-white/60">
                  Monthly
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {formatCurrency(
                    monthlySubscriptions
                  )}
                </p>

                <div className="my-5 h-px bg-white/10" />

                <p className="text-sm text-white/60">
                  Estimated yearly
                </p>

                <p className="mt-2 text-2xl font-bold text-[#C8A96A]">
                  {formatCurrency(
                    monthlySubscriptions * 12
                  )}
                </p>
              </div>
            </PageCard>
          </section>

          <PageCard>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Replacement Planning
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#111827]">
                  Aging devices
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Devices recorded as four years old or
                  older.
                </p>
              </div>
            </div>

            {agingDevices.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
                No aging devices were identified from
                the saved purchase dates.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {agingDevices.map((device) => (
                  <div
                    key={device.id}
                    className="rounded-2xl border border-[#E8E2D6] p-5"
                  >
                    <p className="font-bold text-[#111827]">
                      {device.device_name ||
                        "Unnamed Device"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {device.brand ||
                        "Unknown brand"}
                    </p>

                    <p className="mt-4 text-2xl font-bold text-amber-700">
                      {device.ageInYears.toFixed(1)}{" "}
                      years
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                      Estimated age
                    </p>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </>
      )}
    </PageShell>
  );
}

function InsightStat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Laptop;
}) {
  return (
    <PageCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {value}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={21} />
        </div>
      </div>
    </PageCard>
  );
}

function BreakdownCard({
  eyebrow,
  title,
  items,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  items: BreakdownItem[];
  emptyMessage: string;
}) {
  const maximumValue = Math.max(
    ...items.map((item) => item.value),
    1
  );

  return (
    <PageCard>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[#111827]">
        {title}
      </h2>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#111827]">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {item.count} device
                    {item.count === 1 ? "" : "s"}
                  </p>
                </div>

                <p className="font-bold text-[#111827]">
                  {formatCurrency(item.value)}
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
                <div
                  className="h-full rounded-full bg-[#111827]"
                  style={{
                    width: `${Math.max(
                      (item.value /
                        maximumValue) *
                        100,
                      item.value > 0 ? 5 : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function ProgressMetric({
  label,
  value,
  total,
  suffix = "",
}: {
  label: string;
  value: number;
  total: number;
  suffix?: string;
}) {
  const percentage =
    total > 0
      ? Math.min((value / total) * 100, 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[#111827]">
          {label}
        </p>

        <p className="text-sm text-neutral-500">
          {value}
          {suffix}
          {!suffix && ` / ${total}`}
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
        <div
          className="h-full rounded-full bg-[#111827]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function PremiumInsightsLock({
  deviceCount,
  totalValue,
}: {
  deviceCount: number;
  totalValue: number;
}) {
  return (
    <PageCard className="overflow-hidden p-0">
      <div className="bg-[#111827] p-8 text-white md:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
          <Crown size={24} />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
          Home Tech Vault Pro
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-bold">
          Unlock the full story behind your technology.
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-white/65">
          Your vault currently contains {deviceCount}{" "}
          device{deviceCount === 1 ? "" : "s"} worth{" "}
          {formatCurrency(totalValue)}. Upgrade to see
          room analysis, brand value, warranty forecasts,
          documentation health, replacement planning, and
          smart recommendations.
        </p>

        <Button
          href="/upgrade"
          className="mt-7"
        >
          <Crown size={18} />
          Unlock Vault Insights
        </Button>
      </div>
    </PageCard>
  );
}

function createBreakdown(
  devices: DeviceRecord[],
  getLabel: (device: DeviceRecord) => string
) {
  const breakdown =
    new Map<string, BreakdownItem>();

  for (const device of devices) {
    const label = getLabel(device);

    const current = breakdown.get(label) || {
      label,
      value: 0,
      count: 0,
    };

    current.value += Number(
      device.purchase_price || 0
    );

    current.count += 1;

    breakdown.set(label, current);
  }

  return Array.from(breakdown.values()).sort(
    (first, second) =>
      second.value - first.value
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}