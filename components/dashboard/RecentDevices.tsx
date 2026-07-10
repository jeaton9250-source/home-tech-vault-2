import Link from "next/link";
import { ArrowRight, Laptop, MapPin } from "lucide-react";

export type RecentDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  location: string | null;
  photo_url?: string;
};

type RecentDevicesProps = {
  devices: RecentDevice[];
};

export default function RecentDevices({
  devices,
}: RecentDevicesProps) {
  return (
    <section className="rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            Recent Devices
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Recently added technology in your vault.
          </p>
        </div>

        <Link
          href="/devices"
          className="flex items-center gap-2 text-sm font-semibold text-[#111827]"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[#D8D1C3] bg-[#FBFAF7] p-10 text-center">
          <Laptop
            size={34}
            className="mx-auto text-[#C8A96A]"
          />

          <h3 className="mt-4 font-semibold text-[#111827]">
            No devices yet
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Add your first device to begin building your vault.
          </p>

          <Link
            href="/devices/add"
            className="mt-5 inline-flex rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
          >
            Add Device
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.id}`}
              className="group overflow-hidden rounded-2xl border border-[#E8E2D6] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {device.photo_url ? (
                <img
                  src={device.photo_url}
                  alt={device.device_name || "Device"}
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-[#F7F5EF] text-[#111827]">
                  <Laptop size={38} />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-[#111827]">
                  {device.device_name || "Unnamed Device"}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {device.brand || "Brand not added"}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <MapPin size={13} />
                  {device.location || "Location not added"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}