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
import { applyHouseholdScope } from "@/lib/data/householdScope";

import {
  demoDevices,
  demoDocuments,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";

import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
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
    householdId,
    loading: permissionsLoading,
    canAccessFeature,
  } = usePermissions();

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
      if (permissionsLoading) {
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

        const deviceResult =
          await applyHouseholdScope(
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
              ),
            householdId,
            user.id
          );

        if (deviceResult.error) {
          throw deviceResult.error;
        }

        const loadedDevices =
          (deviceResult.data ??
            []) as DeviceRecord[];

        const deviceIds =
          loadedDevices.map(
            (device) => device.id
          );

        const [
          documentResult,
          subscriptionResult,
          maintenanceResult,
        ] = await Promise.all([
          deviceIds.length > 0
            ? supabase
                .from(
                  "device_documents"
                )
                .select(
                  "id, device_id, document_type"
                )
                .in(
                  "device_id",
                  deviceIds
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),

          applyHouseholdScope(
            supabase
              .from("subscriptions")
              .select(
                `
                id,
                service_name,
                monthly_cost,
                billing_cycle
              `
              ),
            householdId,
            user.id
          ),

          applyHouseholdScope(
            supabase
              .from(
                "maintenance_tasks"
              )
              .select(
                `
                id,
                device_id,
                completed,
                due_date
              `
              ),
            householdId,
            user.id
          ),
        ]);

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
          loadedDevices as DeviceRecord[]
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
    householdId,
    permissionsLoading,
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
    permissionsLoading ||
    loadingInsights;

  const premiumUnlocked =
    isDemo ||
    canAccessFeature("insights");

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
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
      {/* PREMIUM INSIGHTS HERO */}
      <section className="overflow-hidden rounded-[32px] bg-[#183047] text-[#f7f4ed] shadow-[0_28px_70px_-45px_rgba(14,30,44,0.72)]">
        <div className="px-6 py-8 sm:px-10 sm:py-9 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9eb77f]">
                Vault Insights
              </p>

              <h1 className="mt-4 max-w-xl font-serif text-[42px] font-medium leading-[0.98] tracking-[-0.045em] text-[#f7f4ed] sm:text-[52px]">
                Your home,
                <span className="block text-[#8ea864]">
                  understood.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#b9c3c9]">
                See what is protected, what is missing,
                and what deserves your attention next.
              </p>
            </div>

            <div className="grid min-w-[300px] grid-cols-3 gap-6 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <HeroMetric
                label="Protected"
                value={formatCurrency(totalValue)}
              />

              <HeroMetric
                label="Devices"
                value={devices.length.toLocaleString()}
              />

              <HeroMetric
                label="Complete"
                value={`${completenessScore}%`}
              />
            </div>
          </div>

          {!premiumUnlocked ? (
            <div className="mt-7 border-t border-white/10 pt-5">
              <Button
                href="/upgrade"
                variant="secondary"
              >
                <Crown size={17} />
                Unlock full insights
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {isDemo ? (
        <section className="mt-7 rounded-[24px] bg-[#fbf8f2] px-6 py-4 ring-1 ring-[#17212a]/[0.05]">
          <p className="text-sm text-[#68737b]">
            Demo mode uses sample home records.
          </p>
        </section>
      ) : null}

      {!premiumUnlocked ? (
        <div className="mt-7">
          <PremiumInsightsLock
            deviceCount={devices.length}
            totalValue={totalValue}
          />
        </div>
      ) : (
        <>
          {/* HOME HEALTH */}
          <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-7 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] ring-1 ring-[#17212a]/[0.05] sm:px-8 sm:py-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                  Home health
                </p>

                <h2 className="mt-3 max-w-md font-serif text-[32px] font-medium leading-tight tracking-[-0.04em] text-[#17212a] sm:text-[38px]">
                  {completenessScore >= 75
                    ? "Your vault is in strong shape."
                    : completenessScore >= 40
                      ? "Your vault is taking shape."
                      : "Your vault is just getting started."}
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-[#748087]">
                  Completeness is based on documents,
                  serial numbers, and active warranty coverage.
                </p>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.05em] text-[#17212a]">
                    {completenessScore}
                  </span>

                  <span className="mb-1 text-xl text-[#8b9499]">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <ProgressRow
                  label="Documents"
                  value={documentationPercentage}
                />

                <ProgressRow
                  label="Serial numbers"
                  value={serialPercentage}
                />

                <ProgressRow
                  label="Warranty coverage"
                  value={
                    devices.length === 0
                      ? 0
                      : Math.round(
                          (warrantyStats.active /
                            devices.length) *
                            100
                        )
                  }
                />
              </div>
            </div>
          </section>

          {/* WHAT NEEDS ATTENTION */}
          <section className="mt-7 rounded-[28px] bg-white px-6 py-7 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.28)] ring-1 ring-[#17212a]/[0.05] sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
                  Worth your attention
                </p>

                <h2 className="mt-3 font-serif text-[30px] font-medium tracking-[-0.04em] text-[#17212a]">
                  What to improve next.
                </h2>
              </div>
            </div>

            <div className="mt-6 divide-y divide-[#17212a]/[0.07]">
              {recommendations.map(
                (recommendation, index) => (
                  <Link
                    key={recommendation.title}
                    href={recommendation.href}
                    className="group flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-xs font-semibold text-[#617c43]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#17212a]">
                        {recommendation.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#748087]">
                        {recommendation.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="mt-1 shrink-0 text-[#829078] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                )
              )}
            </div>
          </section>

          {/* AT A GLANCE */}
          <section className="mt-7 rounded-[28px] bg-[#f3efe7] px-6 py-7 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
              At a glance
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <GlanceItem
                href="/warranties"
                label="Warranty"
                value={`${warrantyStats.active} covered`}
                detail={`${warrantyStats.missing} missing`}
              />

              <GlanceItem
                href="/subscriptions"
                label="Subscriptions"
                value={`${formatCurrency(monthlySubscriptions)}/mo`}
                detail={`${formatCurrency(
                  monthlySubscriptions * 12
                )}/yr`}
              />

              <GlanceItem
                href="/maintenance"
                label="Maintenance"
                value={`${dueMaintenanceCount} due`}
                detail={
                  dueMaintenanceCount > 0
                    ? "Needs attention"
                    : "All caught up"
                }
              />
            </div>
          </section>

          {/* EXPLORE YOUR HOME */}
          <section className="mt-7 rounded-[28px] bg-[#fbf8f2] px-6 py-7 ring-1 ring-[#17212a]/[0.05] sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78905b]">
              Explore your home
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <CompactBreakdown
                title="By room"
                items={roomBreakdown}
              />

              <CompactBreakdown
                title="By brand"
                items={brandBreakdown}
              />
            </div>

            {agingDevices.length > 0 ? (
              <div className="mt-8 border-t border-[#17212a]/[0.08] pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#17212a]">
                      {agingDevices.length} aging{" "}
                      {agingDevices.length === 1
                        ? "device"
                        : "devices"}
                    </p>

                    <p className="mt-1 text-sm text-[#748087]">
                      Devices recorded as four years old
                      or older.
                    </p>
                  </div>

                  <Link
                    href="/devices"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#617c43]"
                  >
                    Review devices
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : null}
          </section>
        </>
      )}
    </PageShell>
  );

}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#899aa7]">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#f7f4ed]">
        {value}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const normalized = Math.max(
    0,
    Math.min(value, 100)
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-[#17212a]">
          {label}
        </p>

        <p className="text-sm font-semibold text-[#17212a]">
          {normalized}%
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ded8cd]">
        <div
          className="h-full rounded-full bg-[#617c43]"
          style={{
            width: `${normalized}%`,
          }}
        />
      </div>
    </div>
  );
}

function GlanceItem({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8a9487]">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#17212a] transition group-hover:text-[#617c43]">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#7d878d]">
        {detail}
      </p>
    </Link>
  );
}

function CompactBreakdown({
  title,
  items,
}: {
  title: string;
  items: BreakdownItem[];
}) {
  return (
    <div>
      <h3 className="font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[#748087]">
          Not enough information yet.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-[#17212a]/[0.07]">
          {items
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-5 py-3 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17212a]">
                    {item.label}
                  </p>

                  <p className="mt-0.5 text-xs text-[#8b9499]">
                    {item.count}{" "}
                    {item.count === 1
                      ? "device"
                      : "devices"}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-[#17212a]">
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
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
          <p className="text-sm text-text-secondary">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-text-tertiary">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
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
          stroke="#E5E7EB"
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
        <span className="text-5xl font-semibold tracking-[-0.05em] text-text-primary">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-text-tertiary">
            %
          </span>
        </span>

        <span className="mt-2 text-sm font-semibold text-achievement">
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-overline text-charcoal-soft">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            {title}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[22px] bg-surface-sunken p-5 text-sm text-text-secondary">
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
                    <p className="truncate font-semibold text-text-primary">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs text-text-tertiary">
                      {item.count}{" "}
                      {item.count === 1
                        ? "device"
                        : "devices"}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold text-text-primary">
                    {formatCurrency(
                      item.value
                    )}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className="h-full rounded-full bg-home-health"
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
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={20} />
      </div>

      <p className="mt-5 text-overline text-charcoal-soft">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        {title}
      </h2>

      <p className="mt-3 flex-1 text-sm leading-6 text-text-secondary">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-achievement transition hover:text-text-primary"
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

      <p className="mt-2 text-sm leading-6 text-text-secondary">
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
      <div className="htv-plan-band p-8 text-text-primary md:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-section-insights shadow-[var(--shadow-sm)]">
          <Crown size={23} />
        </div>

        <p className="mt-6 text-overline text-charcoal-soft">
          Home Tech Vault Pro
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em]">
          Unlock the story behind
          your technology.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
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