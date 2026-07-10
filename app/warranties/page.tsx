"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getWarrantyDevices } from "@/lib/data/warranties";

type WarrantyGroup =
  | "active"
  | "expiring"
  | "expired"
  | "missing";

type WarrantyDevice = {
  id: string;
  device_name?: string | null;
  brand?: string | null;
  location?: string | null;
  warranty_date?: string | null;
};

type WarrantyStatus = {
  label: string;
  group: WarrantyGroup;
  badgeClass: string;
  days: number | null;
};

function getWarrantyStatus(
  warrantyDate?: string | null
): WarrantyStatus {
  if (!warrantyDate) {
    return {
      label: "Missing warranty",
      group: "missing",
      badgeClass: "bg-neutral-100 text-neutral-700",
      days: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const warranty = new Date(`${warrantyDate}T23:59:59`);

  const diffDays = Math.ceil(
    (warranty.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      label: `Expired ${Math.abs(diffDays)} days ago`,
      group: "expired",
      badgeClass: "bg-red-100 text-red-700",
      days: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Expires today",
      group: "expiring",
      badgeClass: "bg-amber-100 text-amber-800",
      days: diffDays,
    };
  }

  if (diffDays <= 30) {
    return {
      label: `${diffDays} days left`,
      group: "expiring",
      badgeClass: "bg-amber-100 text-amber-800",
      days: diffDays,
    };
  }

  return {
    label: "Active",
    group: "active",
    badgeClass: "bg-emerald-100 text-emerald-700",
    days: diffDays,
  };
}

export default function WarrantiesPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [devices, setDevices] = useState<WarrantyDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDevices() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        const data = await getWarrantyDevices(user);
        setDevices(data || []);
      } catch (error) {
        console.error("Warranty loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load warranty information."
        );
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, [user, demoLoading]);

  const groupedDevices = useMemo(() => {
    return {
      active: devices.filter(
        (device) =>
          getWarrantyStatus(device.warranty_date).group ===
          "active"
      ),

      expiring: devices.filter(
        (device) =>
          getWarrantyStatus(device.warranty_date).group ===
          "expiring"
      ),

      expired: devices.filter(
        (device) =>
          getWarrantyStatus(device.warranty_date).group ===
          "expired"
      ),

      missing: devices.filter(
        (device) =>
          getWarrantyStatus(device.warranty_date).group ===
          "missing"
      ),
    };
  }, [devices]);

  const loading = demoLoading || loadingDevices;

  return (
    <PageShell>
      <PageTitle
        eyebrow="Coverage Center"
        title={
          isDemo
            ? "Demo Warranty Center"
            : "Warranty Center"
        }
        description={
          isDemo
            ? "You are viewing sample warranty information. Sign in to track your own coverage."
            : "Track active, expiring, expired, and missing warranties connected to your vault."
        }
        action={
          <Button
            href={isDemo ? "/login" : "/devices"}
          >
            {isDemo
              ? "Create Your Vault"
              : "View Devices"}
          </Button>
        }
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading warranties...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <WarrantyStat
              title="Active"
              value={groupedDevices.active.length}
              description="Coverage in good standing"
              icon={ShieldCheck}
              iconClass="text-emerald-700"
              iconBackground="bg-emerald-50"
            />

            <WarrantyStat
              title="Expiring Soon"
              value={groupedDevices.expiring.length}
              description="Expires within 30 days"
              icon={CalendarClock}
              iconClass="text-amber-700"
              iconBackground="bg-amber-50"
            />

            <WarrantyStat
              title="Expired"
              value={groupedDevices.expired.length}
              description="Coverage has ended"
              icon={ShieldAlert}
              iconClass="text-red-700"
              iconBackground="bg-red-50"
            />

            <WarrantyStat
              title="Missing"
              value={groupedDevices.missing.length}
              description="Warranty date not added"
              icon={HelpCircle}
              iconClass="text-[#8A6A2F]"
              iconBackground="bg-[#F3EAD7]"
            />
          </section>

          {devices.length === 0 ? (
            <PageCard className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <ShieldCheck size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#111827]">
                No warranty records yet
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-neutral-500">
                Add devices with warranty expiration dates to start
                tracking coverage and upcoming deadlines.
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
          ) : (
            <div className="space-y-6">
              <WarrantySection
                title="Expiring Soon"
                description="These warranties require your attention."
                devices={groupedDevices.expiring}
                icon={AlertTriangle}
              />

              <WarrantySection
                title="Active Warranties"
                description="These devices currently have active coverage."
                devices={groupedDevices.active}
                icon={CheckCircle2}
              />

              <WarrantySection
                title="Expired Warranties"
                description="Coverage for these devices has ended."
                devices={groupedDevices.expired}
                icon={ShieldAlert}
              />

              <WarrantySection
                title="Missing Warranty Information"
                description="Add warranty dates to complete these device records."
                devices={groupedDevices.missing}
                icon={HelpCircle}
              />
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}

type WarrantyStatProps = {
  title: string;
  value: number;
  description: string;
  icon: typeof ShieldCheck;
  iconClass: string;
  iconBackground: string;
};

function WarrantyStat({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  iconBackground,
}: WarrantyStatProps) {
  return (
    <PageCard className="p-6 md:p-6">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBackground} ${iconClass}`}
      >
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        {title}
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

type WarrantySectionProps = {
  title: string;
  description: string;
  devices: WarrantyDevice[];
  icon: typeof ShieldCheck;
};

function WarrantySection({
  title,
  description,
  devices,
  icon: Icon,
}: WarrantySectionProps) {
  return (
    <PageCard>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
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

      {devices.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5 text-sm text-neutral-500">
          No devices in this group.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => (
            <WarrantyDeviceCard
              key={device.id}
              device={device}
            />
          ))}
        </div>
      )}
    </PageCard>
  );
}

function WarrantyDeviceCard({
  device,
}: {
  device: WarrantyDevice;
}) {
  const warranty = getWarrantyStatus(
    device.warranty_date
  );

  const isDemo = device.id.startsWith("demo");

  const card = (
    <article className="h-full rounded-2xl border border-[#E8E2D6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
        Warranty Record
      </p>

      <h3 className="mt-3 text-lg font-bold text-[#111827]">
        {device.device_name || "Unnamed Device"}
      </h3>

      <p className="mt-1 text-sm text-neutral-500">
        {device.brand || "No brand"}
        {" · "}
        {device.location || "No location"}
      </p>

      <span
        className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${warranty.badgeClass}`}
      >
        {warranty.label}
      </span>

      <div className="mt-5 rounded-2xl bg-[#F7F5EF] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
          Warranty Date
        </p>

        <p className="mt-2 text-sm font-semibold text-[#111827]">
          {formatWarrantyDate(device.warranty_date)}
        </p>
      </div>
    </article>
  );

  if (isDemo) {
    return card;
  }

  return (
    <Link
      href={`/devices/${device.id}`}
      className="block"
    >
      {card}
    </Link>
  );
}

function formatWarrantyDate(
  value?: string | null
) {
  if (!value) {
    return "Not added";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}