import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import {
  calculateDeviceHealth,
  getDeviceHealthLabel,
} from "@/lib/calculateDeviceHealth";

import { sections } from "@/lib/design-system/tokens";
import { cn } from "@/lib/design-system/cn";

type DeviceCardProps = {
  device: {
    id: string;
    device_name: string;
    brand?: string | null;
    category?: string | null;
    model_number?: string | null;
    warranty_date?: string | null;
    location?: string | null;
    photo_url?: string | null;
    demo_image?: string | null;
    serial_number?: string | null;
    purchase_date?: string | null;
    purchase_price?: number | null;
    notes?: string | null;
    online?: boolean | null;
    last_seen_at?: string | null;
    ip_address?: string | null;
  };
};

const tech = sections.technology;

export default function DeviceCard({
  device,
}: DeviceCardProps) {
  const cleanDevice = {
    ...device,
    brand: device.brand ?? undefined,
    category: device.category ?? undefined,
    model_number: device.model_number ?? undefined,
    warranty_date: device.warranty_date ?? undefined,
    location: device.location ?? undefined,
    photo_url: device.photo_url ?? undefined,
    serial_number: device.serial_number ?? undefined,
    purchase_date: device.purchase_date ?? undefined,
    purchase_price: device.purchase_price ?? undefined,
    notes: device.notes ?? undefined,
    online: device.online ?? undefined,
    last_seen_at: device.last_seen_at ?? undefined,
    ip_address: device.ip_address ?? undefined,
  };

  const healthScore =
    calculateDeviceHealth(cleanDevice);

  const healthLabel =
    getDeviceHealthLabel(healthScore);

  const isDemo =
    device.id.startsWith("demo");

  const hasNetworkStatus =
    device.online !== null &&
    device.online !== undefined;

  return (
    <Link
      href={`/devices/${device.id}`}
      className="htv-focus-ring block rounded-[var(--radius-card)]"
      aria-label={`View ${device.device_name}`}
    >
      <article className="htv-card-interactive overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm),var(--shadow-inset)]">
        <DeviceImageDisplay
          device={device}
          variant="card"
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="text-overline"
                style={{ color: tech.accent }}
              >
                {device.category || "Device"}
              </p>

              <h2 className="mt-2 truncate text-xl font-medium tracking-[-0.02em] text-text-primary">
                {device.device_name}
              </h2>

              <p className="mt-1 truncate text-sm text-text-secondary">
                {device.brand || "No brand added"}
              </p>
            </div>

            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: tech.soft,
                color: tech.accent,
              }}
            >
              {healthScore}/100
            </span>
          </div>

          {hasNetworkStatus && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  device.online
                    ? "bg-home-health-soft text-home-health"
                    : "bg-surface-sunken text-text-secondary"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    device.online
                      ? "bg-home-health"
                      : "bg-text-tertiary"
                  )}
                />

                {device.online
                  ? "Online"
                  : "Offline"}
              </span>

              <span className="text-xs text-text-tertiary">
                {device.online
                  ? "Seen in latest scan"
                  : formatLastSeen(
                      device.last_seen_at
                    )}
              </span>
            </div>
          )}

          <div className="mt-5 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken p-4 shadow-[var(--shadow-inset)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text-primary">
                Device Health
              </p>

              <p className="text-sm text-text-secondary">
                {healthLabel}
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-base shadow-[var(--shadow-inset)]">
              <div
                className="h-full rounded-full bg-home-health transition-all duration-700 ease-[var(--ease-premium)]"
                style={{
                  width: `${healthScore}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)]">
              <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Location
              </p>

              <p className="mt-2 truncate font-medium text-text-primary">
                {device.location ||
                  "Not added"}
              </p>
            </div>

            <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)]">
              <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Network
              </p>

              <p className="mt-2 truncate font-medium text-text-primary">
                {device.ip_address ||
                  "Not connected"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 font-medium text-text-primary">
            {isDemo
              ? "Demo Preview"
              : "View Details"}

            <ArrowRight
              size={16}
              className="text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-interaction"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

function formatLastSeen(
  value?: string | null
) {
  if (!value) {
    return "Never seen";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last seen unknown";
  }

  const diffMs =
    Date.now() - date.getTime();

  const diffMinutes =
    Math.floor(diffMs / 60000);

  const diffHours =
    Math.floor(diffMinutes / 60);

  const diffDays =
    Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Seen just now";
  }

  if (diffMinutes < 60) {
    return `Seen ${diffMinutes} minute${
      diffMinutes === 1 ? "" : "s"
    } ago`;
  }

  if (diffHours < 24) {
    return `Seen ${diffHours} hour${
      diffHours === 1 ? "" : "s"
    } ago`;
  }

  if (diffDays < 7) {
    return `Seen ${diffDays} day${
      diffDays === 1 ? "" : "s"
    } ago`;
  }

  return `Last seen ${date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  )}`;
}
