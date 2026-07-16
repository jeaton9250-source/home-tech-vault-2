"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
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

import { demoDashboard } from "@/lib/demoData";

type DashboardIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

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

type ImageRow = {
  device_id: string;
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

        const [profileResult, devicesResult] =
          await Promise.all([
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
            "Unable to load profile:",
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

        const totalProtectedValue =
          deviceRows.reduce(
            (total, device) =>
              total +
              Number(
                device.purchase_price || 0
              ),
            0
          );

        setProtectedValue(
          totalProtectedValue
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

        const [
          documentsResult,
          maintenanceResult,
          imagesResult,
        ] = await Promise.all([
          supabase
            .from("documents")
            .select("device_id", {
              count: "exact",
            })
            .eq("user_id", user.id),

          supabase
            .from("maintenance_tasks")
            .select("device_id")
            .eq("user_id", user.id),

          supabase
            .from("device_images")
            .select("device_id")
            .eq("user_id", user.id),
        ]);

        if (documentsResult.error) {
          console.error(
            "Unable to load documents:",
            documentsResult.error
          );
        }

        if (maintenanceResult.error) {
          console.error(
            "Unable to load maintenance:",
            maintenanceResult.error
          );
        }

        if (imagesResult.error) {
          console.error(
            "Unable to load images:",
            imagesResult.error
          );
        }

        setDocumentCount(
          documentsResult.error
            ? 0
            : documentsResult.count || 0
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
            notes: device.notes || "",
          }));

        const deviceIdsWithPhotos =
          new Set(
            (
              (imagesResult.data ||
                []) as ImageRow[]
            ).map(
              (image) => image.device_id
            )
          );

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
      } catch (error: unknown) {
        const possibleError = error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

        console.error(
          "Dashboard loading error:",
          {
            message:
              possibleError?.message,
            details:
              possibleError?.details,
            hint: possibleError?.hint,
            code: possibleError?.code,
            rawError: error,
          }
        );

        setErrorMessage(
          possibleError?.message ||
            possibleError?.details ||
            "Unable to load your dashboard."
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
      : "Your home technology records are looking organized.");

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
      <section className="overflow-hidden rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">
              {greeting}, {firstName}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Welcome back.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
              Everything important about your
              home technology, in one place.
            </p>

            <p className="mt-5 text-sm font-medium text-[#D4BC87]">
              {householdName}
            </p>
          </div>

          <Button
            href="/devices/add"
            variant="secondary"
          >
            <Plus size={17} />
            Add Device
          </Button>
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            You are exploring a sample
            household. Create an account to
            organize your own devices and
            documents.
          </p>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <PageCard className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Technology Health
          </p>

          <div className="mt-7">
            <VaultHealthRing
              score={vaultScore.total}
              label={vaultScore.label}
            />
          </div>

          <p className="mt-7 max-w-sm text-sm leading-6 text-neutral-500">
            Your score reflects how complete
            and protected your home technology
            records are.
          </p>
        </PageCard>

        <PageCard className="flex min-h-[360px] flex-col justify-between p-8 md:p-10">
          <div>
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Protected Assets
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                  {formatCurrency(
                    protectedValue
                  )}
                </h2>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <ShieldCheck size={23} />
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-500">
              The total purchase value of
              technology currently recorded in
              your vault.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <AssetMetric
              value={deviceCount}
              label="Devices"
            />

            <AssetMetric
              value={activeWarrantyCount}
              label="Warranties"
            />

            <AssetMetric
              value={documentCount}
              label="Documents"
            />
          </div>
        </PageCard>
      </section>

      <PageCard className="bg-[#111827] p-8 text-white md:p-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
                <Sparkles size={19} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
                Today&apos;s Insight
              </p>
            </div>

            <h2 className="mt-5 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-3xl">
              {primaryInsight}
            </h2>
          </div>

          <Button
            href="/insights"
            variant="secondary"
          >
            View Details
            <ArrowRight size={16} />
          </Button>
        </div>
      </PageCard>

      <PageCard className="p-6 md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Quick Actions
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            What would you like to do?
          </h2>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            href="/devices/add"
            icon={Plus}
            label="Add Device"
          />

          <QuickAction
            href="/documents/upload"
            icon={FileText}
            label="Upload Document"
          />

          <QuickAction
            href="/network/discover"
            icon={Radar}
            label="Scan Network"
          />

          <QuickAction
            href="/maintenance"
            icon={Wrench}
            label="Maintenance"
          />
        </div>
      </PageCard>
    </PageShell>
  );
}

function VaultHealthRing({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(score, 100)
  );

  const radius = 72;

  const circumference =
    2 * Math.PI * radius;

  const progressOffset =
    circumference -
    (normalizedScore / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox="0 0 176 176"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Technology health score: ${normalizedScore}%`}
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
          strokeDashoffset={
            progressOffset
          }
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

function AssetMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xl font-semibold text-[#111827]">
        {value.toLocaleString()}
      </p>

      <p className="mt-1 text-xs text-neutral-500">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: DashboardIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[#E8E2D6] p-4 transition hover:border-[#C8A96A] hover:bg-[#FCFAF6]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={18} />
      </div>

      <span className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">
        {label}
      </span>

      <ArrowRight
        size={16}
        className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-[#111827]"
      />
    </a>
  );
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