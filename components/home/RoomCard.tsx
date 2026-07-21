import Link from "next/link";
import { MapPin } from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";

export type RoomDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  photo_url?: string;
  demo_image?: string;
};

type RoomCardProps = {
  roomName: string;
  devices: RoomDevice[];
};

export default function RoomCard({
  roomName,
  devices,
}: RoomCardProps) {
  const totalValue = devices.reduce(
    (total, device) => total + Number(device.purchase_price || 0),
    0
  );

  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-border-subtle p-6">
        <div>
          <div className="flex items-center gap-2 text-interaction">
            <MapPin size={17} />

            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Room
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {roomName}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {devices.length} device{devices.length === 1 ? "" : "s"} ·{" "}
            ${totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}{" "}
            protected
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => (
          <Link
            key={device.id}
            href={`/devices/${device.id}`}
            className="group overflow-hidden rounded-[var(--radius-button)] border border-border-subtle bg-surface-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <DeviceImageDisplay
              device={device}
              variant="room"
              className="h-36"
            />

            <div className="p-4">
              <p className="text-overline text-charcoal-soft">
                {device.category || "Uncategorized"}
              </p>

              <h3 className="mt-2 truncate font-semibold text-text-primary">
                {device.device_name || "Unnamed Device"}
              </h3>

              <p className="mt-1 truncate text-sm text-text-secondary">
                {device.brand || "Brand not added"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}