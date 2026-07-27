import Link from "next/link";
import {
  ArrowRight,
  Wifi,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";
import {
  calculateDeviceHealth,
} from "@/lib/calculateDeviceHealth";

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

  const isDemo =
    device.id.startsWith("demo");

  const hasNetworkStatus =
    device.online !== null &&
    device.online !== undefined;

  return (
    <Link
      href={`/devices/${device.id}`}
      className="group block rounded-[24px] focus-visible:outline-none"
      aria-label={`View ${device.device_name}`}
    >
      <article className="htv-glass-card group-hover:htv-glass-card-elevated overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
        <div className="relative">
          <DeviceImageDisplay
            device={device}
            variant="card"
          />

          {/* Floating Online Status Badge */}
          {hasNetworkStatus && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={cn(
                  "htv-glass-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-md",
                  device.online
                    ? "text-home-health bg-home-health-soft/90 border-home-health/30"
                    : "text-text-muted bg-surface-card/90"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    device.online
                      ? "bg-home-health animate-pulse"
                      : "bg-text-tertiary"
                  )}
                />
                {device.online ? "Online" : "Offline"}
              </span>
            </div>
          )}

          {/* Health Score Pill */}
          <div className="absolute top-3 right-3 z-10">
            <span className="htv-glass-pill px-3 py-1 text-xs font-bold text-text-primary bg-surface-card/90 border-border-subtle shadow-md">
              {healthScore}%
            </span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
                {device.category || "Hardware Hub"}
              </p>

              <h3 className="mt-1 truncate text-lg font-bold tracking-tight text-text-primary group-hover:text-interaction transition-colors">
                {device.device_name}
              </h3>

              <p className="mt-0.5 truncate text-xs font-medium text-text-secondary">
                {device.brand || "Smart Home Hardware"}
              </p>
            </div>
          </div>

          {/* Location & Network Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {device.location ? (
              <span className="htv-glass-pill inline-flex items-center gap-1.5 px-3 py-1 font-semibold text-text-secondary">
                <MapPin size={12} className="text-text-muted" />
                {device.location}
              </span>
            ) : null}

            {device.ip_address ? (
              <span className="htv-glass-pill inline-flex items-center gap-1.5 px-3 py-1 font-semibold text-text-secondary">
                <Wifi size={12} className="text-text-muted" />
                {device.ip_address}
              </span>
            ) : null}
          </div>

          {/* Health Bar */}
          <div className="mt-4 pt-3 border-t border-border-subtle/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-text-muted flex items-center gap-1">
                <ShieldCheck size={13} className="text-home-health" />
                Health Rating
              </span>
              <span className="font-semibold text-text-primary">{healthScore}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-home-health transition-all duration-700"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-text-primary pt-2">
            <span>{isDemo ? "Explore Demo Hub" : "Device Settings & History"}</span>
            <ArrowRight
              size={15}
              className="text-text-tertiary transition-transform group-hover:translate-x-1 group-hover:text-interaction"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

