"use client";
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Crown,
  FileText,
  Laptop,
  Loader2,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wrench,
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
  document_type?: string | null;
};

type SubscriptionRecord = {
  id: string;
  service_name: string | null;
  monthly_cost: number | null;
  billing_cycle?: string | null;
};

type MaintenanceRecord = {
  id: string;
  device_id: string | null;
  completed: boolean;
  due_date: string | null;
};

type BreakdownItem = {
  label: string;
  value: number;
  count: number;
};

type InsightIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

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

  const [
    loadingInsights,
    setLoadingInsights,
  ] = useState(true);

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
              device_name:
                device.device_name,
              brand: device.brand,
              category:
                device.category,
              location:
                device.location,
              purchase_price:
                device.purchase_price,
              purchase_date:
                device.purchase_date,
              warranty_date:
                device.warranty_date,
              serial_number:
                device.serial_number,
              notes: device.notes,
            }))
          );

          setDocuments(
            demoDocuments.map(
              (document) => ({
                id: document.id,
                device_id:
                  document.device_id,
                document_type:
                  document.document_type,
              })
            )
          );

          setSubscriptions(
            demoSubscriptions.map(
              (subscription) => ({
                id: subscription.id,
                service_name:
                  subscription.service_name,
                monthly_cost:
                  subscription.monthly_cost,
                billing_cycle:
                  subscription.billing_cycle ??
                  null,
              })
            )
          );

          setMaintenance(
            demoMaintenance.map(
              (item) => ({
                id: item.id,
                device_id:
                  item.device_id,
                completed:
                  String(
                    item.status || ""
                  )
                    .toLowerCase()
                    .includes(
                      "complete"
                    ),
                due_date:
                  item.due_date,
              })
            )
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
              `
                id,
                service_name,
                monthly_cost,
                billing_cycle
              `
            )
            .eq("user_id", user.id),

          supabase
            .from("maintenance_tasks")
            .select(
              `
                id,
                device_id,
                completed,
                due_date
              `
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
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Unable to load Vault Insights:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load Vault Insights."
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
          Number(
            device.purchase_price ||
              0
          ),
        0
      ),
    [devices]
  );

  const monthlySubscriptions =
    useMemo(
      () =>
        subscriptions.reduce(
          (total, subscription) =>
            total +
            getMonthlyEquivalent(
              subscription
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

      if (
        Number.isNaN(
          expiration.getTime()
        )
      ) {
        missing += 1;
        continue;
      }

      const daysRemaining =
        Math.ceil(
          (expiration.getTime() -
            today.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        );

      if (daysRemaining < 0) {
        expired += 1;
      } else {
        active += 1;

        if (daysRemaining <= 60) {
          expiringSoon += 1;
        }
      }
    }

    return {
      active,
      expiringSoon,
      expired,
      missing,
    };
  }, [devices]);

  const deviceIdsWithDocuments =
    useMemo(
      () =>
        new Set(
          documents
            .map(
              (document) =>
                document.device_id
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        ),
      [documents]
    );

  const documentedDevices =
    deviceIdsWithDocuments.size;

  const devicesWithSerialNumbers =
    useMemo(
      () =>
        devices.filter((device) =>
          Boolean(
            device.serial_number?.trim()
          )
        ).length,
      [devices]
    );

  const documentationPercentage =
    devices.length === 0
      ? 0
      : Math.round(
          (documentedDevices /
            devices.length) *
            100
        );

  const serialPercentage =
    devices.length === 0
      ? 0
      : Math.round(
          (devicesWithSerialNumbers /
            devices.length) *
            100
        );

  const completenessScore =
    devices.length === 0
      ? 0
      : Math.round(
          (documentationPercentage +
            serialPercentage +
            Math.round(
              (warrantyStats.active /
                devices.length) *
                100
            )) /
            3
        );

  const averageDeviceAge =
    useMemo(() => {
      const today = new Date();

      const ages = devices
        .filter((device) =>
          Boolean(
            device.purchase_date
          )
        )
        .map((device) => {
          const purchaseDate =
            new Date(
              `${device.purchase_date}T00:00:00`
            );

          return (
            (today.getTime() -
              purchaseDate.getTime()) /
            (1000 *
              60 *
              60 *
              24 *
              365.25)
          );
        })
        .filter(
          (age) =>
            Number.isFinite(age) &&
            age >= 0
        );

      if (ages.length === 0) {
        return 0;
      }

      return (
        ages.reduce(
          (total, age) =>
            total + age,
          0
        ) / ages.length
      );
    }, [devices]);

  const agingDevices = useMemo(() => {
    const today = new Date();

    return devices
      .filter((device) =>
        Boolean(
          device.purchase_date
        )
      )
      .map((device) => {
        const purchaseDate =
          new Date(
            `${device.purchase_date}T00:00:00`
          );

        const ageInYears =
          (today.getTime() -
            purchaseDate.getTime()) /
          (1000 *
            60 *
            60 *
            24 *
            365.25);

        return {
          ...device,
          ageInYears,
        };
      })
      .filter(
        (device) =>
          Number.isFinite(
            device.ageInYears
          ) &&
          device.ageInYears >= 4
      )
      .sort(
        (first, second) =>
          second.ageInYears -
          first.ageInYears
      )
      .slice(0, 4);
  }, [devices]);

  const dueMaintenanceCount =
    useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return maintenance.filter(
        (item) => {
          if (
            item.completed ||
            !item.due_date
          ) {
            return false;
          }

          const dueDate = new Date(
            `${item.due_date}T00:00:00`
          );

          return (
            !Number.isNaN(
              dueDate.getTime()
            ) && dueDate <= today
          );
        }
      ).length;
    }, [maintenance]);

  const recommendations =
    useMemo(() => {
      const items: {
        title: string;
        description: string;
        href: string;
      }[] = [];

      const missingDocuments =
        Math.max(
          devices.length -
            documentedDevices,
          0
        );

      const missingSerials =
        Math.max(
          devices.length -
            devicesWithSerialNumbers,
          0
        );

      if (missingDocuments > 0) {
        items.push({
          title: `Add documents to ${missingDocuments} device${
            missingDocuments === 1
              ? ""
              : "s"
          }`,
          description:
            "Receipts, manuals, and warranty files make your vault more useful.",
          href: "/documents/upload",
        });
      }

      if (missingSerials > 0) {
        items.push({
          title: `Add ${missingSerials} missing serial number${
            missingSerials === 1
              ? ""
              : "s"
          }`,
          description:
            "Serial numbers are especially useful for insurance and support.",
          href: "/devices",
        });
      }

      if (
        warrantyStats.expiringSoon >
        0
      ) {
        items.push({
          title: `${warrantyStats.expiringSoon} warranty${
            warrantyStats.expiringSoon ===
            1
              ? ""
              : "ies"
          } expiring soon`,
          description:
            "Review coverage before it ends and save any renewal information.",
          href: "/warranties",
        });
      }

      if (
        dueMaintenanceCount > 0
      ) {
        items.push({
          title: `${dueMaintenanceCount} maintenance task${
            dueMaintenanceCount === 1
              ? ""
              : "s"
          } need attention`,
          description:
            "Complete overdue care to keep your device history current.",
          href: "/maintenance",
        });
      }

      if (items.length === 0) {
        items.push({
          title:
            "Your vault looks organized",
          description:
            "Keep your device details, documents, and warranties current.",
          href: "/devices",
        });
      }

      return items.slice(0, 3);
    }, [
      devices,
      documentedDevices,
      devicesWithSerialNumbers,
      warrantyStats.expiringSoon,
      dueMaintenanceCount,
    ]);

  const strongestRoom =
    roomBreakdown[0] || null;

  const strongestBrand =
    brandBreakdown[0] || null;

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

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load insights
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
              Vault Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your insights.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Understand the value,
              completeness, coverage, and
              health of your home
              technology.
            </p>
          </div>

          {!premiumUnlocked && (
            <Button
              href="/upgrade"
              variant="secondary"
            >
              <Crown size={17} />
              Unlock Insights
            </Button>
          )}
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            These insights are calculated
            from sample devices,
            subscriptions, warranties,
            documents, and maintenance.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={WalletCards}
          label="Protected Value"
          value={formatCurrency(
            totalValue
          )}
          description="Recorded purchase value"
        />

        <SummaryCard
          icon={Laptop}
          label="Devices"
          value={devices.length.toLocaleString()}
          description={`${roomBreakdown.length} locations`}
        />

        <SummaryCard
          icon={FileText}
          label="Documented"
          value={`${documentationPercentage}%`}
          description={`${documentedDevices} devices with files`}
        />

        <SummaryCard
          icon={BarChart3}
          label="Average Age"
          value={
            averageDeviceAge > 0
              ? `${averageDeviceAge.toFixed(
                  1
                )} yrs`
              : "—"
          }
          description="Based on purchase dates"
        />
      </section>

      {!premiumUnlocked ? (
        <PremiumInsightsLock
          deviceCount={devices.length}
          totalValue={totalValue}
        />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <PageCard className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Vault Completeness
              </p>

              <div className="mt-7">
                <InsightRing
                  score={
                    completenessScore
                  }
                />
              </div>

              <p className="mt-7 max-w-sm text-sm leading-6 text-neutral-500">
                Based on documents,
                serial numbers, and active
                warranty information.
              </p>
            </PageCard>

            <PageCard className="p-7 md:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Recommended Next Steps
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    Improve your vault
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                    A few useful actions
                    based on your saved
                    records.
                  </p>
                </div>

                <Sparkles
                  size={21}
                  className="shrink-0 text-[#C8A96A]"
                />
              </div>

              <div className="mt-7 space-y-3">
                {recommendations.map(
                  (recommendation) => (
                    <Link
                      key={
                        recommendation.title
                      }
                      href={
                        recommendation.href
                      }
                      className="group flex items-start gap-4 rounded-[22px] bg-[#F7F5EF] p-4 transition hover:bg-[#F1EEE6]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C8A96A] shadow-sm">
                        <ShieldCheck
                          size={18}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#111827]">
                          {
                            recommendation.title
                          }
                        </p>

                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                          {
                            recommendation.description
                          }
                        </p>
                      </div>

                      <ArrowRight
                        size={16}
                        className="mt-1 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-[#111827]"
                      />
                    </Link>
                  )
                )}
              </div>
            </PageCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <BreakdownCard
              icon={Building2}
              eyebrow="Rooms"
              title="Value by room"
              items={roomBreakdown}
              emptyMessage="Add device locations to see room insights."
            />

            <BreakdownCard
              icon={Laptop}
              eyebrow="Brands"
              title="Value by brand"
              items={brandBreakdown}
              emptyMessage="Add device brands to see brand insights."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <SimpleInsightCard
              icon={ShieldCheck}
              eyebrow="Warranty Health"
              title={`${warrantyStats.active} covered`}
              description={`${warrantyStats.expiringSoon} expiring soon, ${warrantyStats.expired} expired, and ${warrantyStats.missing} missing.`}
              href="/warranties"
              linkLabel="View warranties"
            />

            <SimpleInsightCard
              icon={WalletCards}
              eyebrow="Subscriptions"
              title={formatCurrency(
                monthlySubscriptions
              )}
              description={`${formatCurrency(
                monthlySubscriptions * 12
              )} estimated per year.`}
              href="/subscriptions"
              linkLabel="View subscriptions"
            />

            <SimpleInsightCard
              icon={Wrench}
              eyebrow="Maintenance"
              title={`${dueMaintenanceCount} due`}
              description={
                dueMaintenanceCount > 0
                  ? "Maintenance tasks currently require attention."
                  : "No overdue maintenance was found."
              }
              href="/maintenance"
              linkLabel="View maintenance"
            />
          </section>

          {(strongestRoom ||
            strongestBrand) && (
            <PageCard className="bg-[#111827] p-7 text-white md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                What Stands Out
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {strongestRoom && (
                  <HighlightItem
                    label="Highest-value room"
                    title={
                      strongestRoom.label
                    }
                    description={`${formatCurrency(
                      strongestRoom.value
                    )} across ${
                      strongestRoom.count
                    } device${
                      strongestRoom.count ===
                      1
                        ? ""
                        : "s"
                    }.`}
                  />
                )}

                {strongestBrand && (
                  <HighlightItem
                    label="Top brand"
                    title={
                      strongestBrand.label
                    }
                    description={`${formatCurrency(
                      strongestBrand.value
                    )} across ${
                      strongestBrand.count
                    } device${
                      strongestBrand.count ===
                      1
                        ? ""
                        : "s"
                    }.`}
                  />
                )}
              </div>
            </PageCard>
          )}

          {agingDevices.length > 0 && (
            <PageCard className="p-7 md:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <AlertTriangle
                    size={20}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Replacement Planning
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    Aging devices
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Devices recorded as
                    four years old or older.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {agingDevices.map(
                  (device) => (
                    <Link
                      key={device.id}
                      href={`/devices/${device.id}`}
                      className="rounded-[24px] bg-[#F7F5EF] p-5 transition hover:bg-[#F1EEE6]"
                    >
                      <p className="font-semibold text-[#111827]">
                        {device.device_name ||
                          "Unnamed Device"}
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        {device.brand ||
                          "Unknown brand"}
                      </p>

                      <p className="mt-5 text-2xl font-semibold text-amber-700">
                        {device.ageInYears.toFixed(
                          1
                        )}{" "}
                        years
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Estimated age
                      </p>
                    </Link>
                  )
                )}
              </div>
            </PageCard>
          )}
        </>
      )}
    </PageShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: InsightIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function InsightRing({
  score,
}: {
  score: number;
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(score, 100)
  );

  const radius = 72;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (normalizedScore / 100) *
      circumference;

  const label =
    normalizedScore >= 90
      ? "Excellent"
      : normalizedScore >= 75
        ? "Good"
        : normalizedScore >= 50
          ? "Needs Work"
          : "Getting Started";

  return (
    <div className="relative h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox="0 0 176 176"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Vault completeness: ${normalizedScore}%`}
      >
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#E8E2D6"
          strokeWidth="12"
        />

        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-[#111827]">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-neutral-400">
            %
          </span>
        </span>

        <span className="mt-2 text-sm font-semibold text-[#8A6A2F]">
          {label}
        </span>
      </div>
    </div>
  );
}

function BreakdownCard({
  icon: Icon,
  eyebrow,
  title,
  items,
  emptyMessage,
}: {
  icon: InsightIcon;
  eyebrow: string;
  title: string;
  items: BreakdownItem[];
  emptyMessage: string;
}) {
  const maximumValue = Math.max(
    ...items.map(
      (item) => item.value
    ),
    1
  );

  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            {title}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[22px] bg-[#F7F5EF] p-5 text-sm text-neutral-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          {items
            .slice(0, 5)
            .map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      {item.count}{" "}
                      {item.count === 1
                        ? "device"
                        : "devices"}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-[#111827]">
                    {formatCurrency(
                      item.value
                    )}
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
                        item.value > 0
                          ? 5
                          : 0
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

function SimpleInsightCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: InsightIcon;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <PageCard className="flex h-full flex-col p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={20} />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
        {title}
      </h2>

      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A2F] transition hover:text-[#111827]"
      >
        {linkLabel}
        <ArrowRight size={15} />
      </Link>
    </PageCard>
  );
}

function HighlightItem({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/55">
        {description}
      </p>
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
          <Crown size={23} />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
          Home Tech Vault Pro
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em]">
          Unlock the story behind
          your technology.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
          Your vault contains{" "}
          {deviceCount}{" "}
          {deviceCount === 1
            ? "device"
            : "devices"}{" "}
          worth{" "}
          {formatCurrency(
            totalValue
          )}
          . Upgrade to see room
          analysis, brand value,
          warranty health,
          replacement planning, and
          smart recommendations.
        </p>

        <Button
          href="/upgrade"
          variant="secondary"
          className="mt-7"
        >
          <Crown size={17} />
          Unlock Insights
        </Button>
      </div>
    </PageCard>
  );
}

function createBreakdown(
  devices: DeviceRecord[],
  getLabel: (
    device: DeviceRecord
  ) => string
) {
  const breakdown =
    new Map<
      string,
      BreakdownItem
    >();

  for (const device of devices) {
    const label =
      getLabel(device);

    const current =
      breakdown.get(label) || {
        label,
        value: 0,
        count: 0,
      };

    current.value += Number(
      device.purchase_price || 0
    );

    current.count += 1;

    breakdown.set(
      label,
      current
    );
  }

  return Array.from(
    breakdown.values()
  ).sort(
    (first, second) =>
      second.value -
      first.value
  );
}

function getMonthlyEquivalent(
  subscription: SubscriptionRecord
) {
  const amount = Number(
    subscription.monthly_cost || 0
  );

  const cycle =
    subscription.billing_cycle
      ?.trim()
      .toLowerCase() || "";

  if (
    cycle.includes("annual") ||
    cycle.includes("year")
  ) {
    return amount / 12;
  }

  if (cycle.includes("week")) {
    return (
      amount * 52
    ) / 12;
  }

  if (
    cycle.includes("quarter")
  ) {
    return amount / 3;
  }

  return amount;
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