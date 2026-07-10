import Link from "next/link";
import { Laptop, MapPin } from "lucide-react";

export type RoomDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  photo_url?: string;
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
    <section className="overflow-hidden rounded-[32px] border border-[#E8E2D6] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E8E2D6] p-6">
        <div>
          <div className="flex items-center gap-2 text-[#C8A96A]">
            <MapPin size={17} />

            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              Room
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-bold text-[#111827]">
            {roomName}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
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
            className="group overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {device.photo_url ? (
              <div className="overflow-hidden">
                <img
                  src={device.photo_url}
                  alt={device.device_name || "Device"}
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center bg-[#F7F5EF] text-[#111827]">
                <Laptop size={38} />
              </div>
            )}

            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
                {device.category || "Uncategorized"}
              </p>

              <h3 className="mt-2 truncate font-semibold text-[#111827]">
                {device.device_name || "Unnamed Device"}
              </h3>

              <p className="mt-1 truncate text-sm text-neutral-500">
                {device.brand || "Brand not added"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}