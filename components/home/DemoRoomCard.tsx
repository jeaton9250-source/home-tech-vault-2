"use client";

import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Car,
  ChefHat,
  Home,
  Laptop,
  MapPin,
  Shirt,
  Sofa,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";

type DemoDevice = {
  id: string;
  deviceName: string;
  brand?: string | null;
  category?: string | null;
  demoImage?: string | null;
};

export type DemoRoom = {
  name: string;
  deviceCount: number;
  photoCount: number;
  documentCount: number;
  recordedValue: number;
  completeness: number;
  coverImageUrl?: string | null;
  devices: DemoDevice[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRoomIcon(roomName: string) {
  const name = roomName.toLowerCase();

  if (name.includes("office")) {
    return Laptop;
  }

  if (name.includes("bed")) {
    return BedDouble;
  }

  if (name.includes("living")) {
    return Sofa;
  }

  if (name.includes("kitchen")) {
    return ChefHat;
  }

  if (name.includes("laundry")) {
    return Shirt;
  }

  if (name.includes("garage")) {
    return Car;
  }

  return Home;
}

export default function DemoRoomCard({ room }: { room: DemoRoom }) {
  const Icon = getRoomIcon(room.name);

  const previewDevices = room.devices.slice(0, 4);

  const remainingDevices = room.deviceCount - previewDevices.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#fbfaf7] shadow-[0_20px_50px_-38px_rgba(23,33,42,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_65px_-36px_rgba(23,33,42,0.58)]">
      <div className="overflow-hidden">
        <div className="relative min-h-[170px] overflow-hidden bg-[#e8e4da]">
          {room.coverImageUrl ? (
            <>
              <img
                src={room.coverImageUrl}
                alt={`${room.name} room`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-[#101a22]/10 via-transparent to-[#101a22]/25" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#e4e9e4_0%,#f0ece3_52%,#e5ddd0_100%)]" />
          )}

          <div className="relative flex items-start justify-between gap-4 p-6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-md"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(255,255,255,.72)",
                color: "#20384b",
              }}
            >
              <Icon size={22} />
            </div>

            <span
              className="relative z-20 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold shadow-md"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(34,99,65,.35)",
                color: "#17643a",
              }}
            >
              Complete
            </span>
          </div>
        </div>

        <div
          className="px-6 py-4"
          style={{
            backgroundColor: "#172b3a",
            color: "#ffffff",
          }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/55">
            In your home
          </p>

          <h3 className="mt-1.5 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
            {room.name}
          </h3>

          <p className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-white/75">
            <MapPin size={14} />
            {room.deviceCount}{" "}
            {room.deviceCount === 1 ? "thing remembered" : "things remembered"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-5">
        <div className="min-h-[126px] space-y-3">
          {previewDevices.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.id}`}
              className="group/device flex items-center gap-3 rounded-2xl px-1 py-1.5 transition hover:bg-[#f4f1e9]"
            >
              <DeviceImageDisplay
                device={{
                  id: device.id,
                  device_name: device.deviceName,
                  brand: device.brand,
                  category: device.category,
                  demo_image: device.demoImage,
                }}
                variant="thumbnail"
                className="!aspect-auto h-10 w-10 shrink-0 rounded-xl"
                imageClassName="!p-1.5"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {device.deviceName}
                </p>

                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {[device.brand, device.category]
                    .filter(Boolean)
                    .join(" · ") || "Device"}
                </p>
              </div>

              <ArrowRight size={14} className="shrink-0 text-text-tertiary" />
            </Link>
          ))}

          {remainingDevices > 0 ? (
            <p className="pl-[52px] text-xs font-semibold text-text-tertiary">
              +{remainingDevices} more
            </p>
          ) : null}
        </div>

        <div className="mt-auto border-t border-[#182533]/8 pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-tertiary">
            <span className="font-semibold text-text-primary">
              {formatCurrency(room.recordedValue)}
            </span>

            <span>
              {room.photoCount} {room.photoCount === 1 ? "photo" : "photos"}
            </span>

            <span>
              {room.documentCount}{" "}
              {room.documentCount === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-text-tertiary">
              Room Readiness{" "}
              <span className="font-semibold text-text-primary">
                {room.completeness}%
              </span>
            </p>

            <Link
              href={`/devices?search=${encodeURIComponent(room.name)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6d2c]"
            >
              Open Room
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
