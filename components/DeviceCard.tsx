import Link from "next/link";
import {
  ArrowRight,
  Laptop,
  Radio,
} from "lucide-react";

import {
  calculateDeviceHealth,
  getDeviceHealthLabel,
} from "@/lib/calculateDeviceHealth";

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
  const healthScore = calculateDeviceHealth(cleanDevice);
  const healthLabel = getDeviceHealthLabel(healthScore);
  const isDemo = device.id.startsWith("demo");

  const hasNetworkStatus =
    device.online !== null &&
    device.online !== undefined;

  const card = (
    <article className="overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {device.photo_url ? (
        <img
          src={device.photo_url}
          alt={device.device_name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-[#F7F5EF] text-[#C8A96A]">
          <Laptop size={56} />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
              {device.category || "Device"}
            </p>

            <h2 className="mt-2 truncate text-xl font-bold text-[#111827]">
              {device.device_name}
            </h2>

            <p className="mt-1 truncate text-sm text-neutral-500">
              {device.brand || "No brand added"}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#F3EAD7] px-3 py-1 text-xs font-semibold text-[#8A6A2F]">
            {healthScore}/100
          </span>
        </div>

        {hasNetworkStatus && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                device.online
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  device.online
                    ? "bg-emerald-500"
                    : "bg-neutral-400"
                }`}
              />

              {device.online ? "Online" : "Offline"}
            </span>

            <span className="text-xs text-neutral-400">
              {device.online
                ? "Seen in latest scan"
                : formatLastSeen(device.last_seen_at)}
            </span>
          </div>
        )}

        <div className="mt-5 rounded-2xl bg-[#F7F5EF] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#111827]">
              Device Health
            </p>

            <p className="text-sm text-neutral-500">
              {healthLabel}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E2D6]">
            <div
              className="h-full rounded-full bg-[#111827]"
              style={{
                width: `${healthScore}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-[#E8E2D6] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Location
            </p>

            <p className="mt-2 truncate font-semibold text-[#111827]">
              {device.location || "Not added"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E2D6] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Network
            </p>

            <p className="mt-2 truncate font-semibold text-[#111827]">
              {device.ip_address || "Not connected"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 font-semibold text-[#111827]">
          {isDemo ? "Demo Preview" : "View Details"}
          <ArrowRight size={16} />
        </div>
      </div>
    </article>
  );

  if (isDemo) {
    return card;
  }

  return (
    <Link href={`/devices/${device.id}`}>
      {card}
    </Link>
  );
}

function formatLastSeen(value?: string | null) {
  if (!value) {
    return "Never seen";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last seen unknown";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

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

  return `Last seen ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}