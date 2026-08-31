"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  ImageIcon,
  Loader2,
  MapPin,
} from "lucide-react";

import DeviceImageDisplay from "@/components/devices/DeviceImageDisplay";

export type RealRoomSummary = {
  id?: string;
  name: string;
  deviceCount: number;
  photoCount: number;
  documentCount: number;
  recordedValue: number;
  completeness: number;
  expiringWarrantyCount: number;
  coverImageUrl?: string | null;
  coverImagePath?: string | null;
  devices: Array<{
    id: string;
    deviceName: string;
    brand?: string | null;
    category?: string | null;
    demoImage?: string | null;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRoomIcon(_roomName: string) {
  return MapPin;
}

function getRoomVisualClass(_roomName: string) {
  return "bg-[#edf0e8]";
}

function RoomStatusBadge({ completeness }: { completeness: number }) {
  const complete = completeness >= 100;

  return (
    <span
      className="relative z-20 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold shadow-sm"
      style={{
        backgroundColor: complete ? "#ffffff" : "#fff8eb",
        borderColor: complete ? "rgba(34,99,65,.28)" : "rgba(168,95,8,.22)",
        color: complete ? "#17643a" : "#a85f08",
      }}
    >
      {complete ? "Complete" : "Details to finish"}
    </span>
  );
}

export default function RealRoomCard({
  room,
  canEdit = false,
  savingCover = false,
  onCoverChange,
  onRemoveCover,
}: {
  room: RealRoomSummary;
  canEdit?: boolean;
  savingCover?: boolean;
  onCoverChange?: (room: RealRoomSummary, file: File) => void | Promise<void>;
  onRemoveCover?: (room: RealRoomSummary) => void | Promise<void>;
}) {
  const Icon = getRoomIcon(room.name);

  const previewDevices = room.devices.slice(0, 4);

  const remainingDevices = room.deviceCount - previewDevices.length;

  const isUnassigned = room.name.toLowerCase() === "unassigned";

  const visualClass = getRoomVisualClass(room.name);

  if (isUnassigned) {
    return (
      <article className="group h-full overflow-hidden rounded-[28px] border border-dashed border-[#a98650]/30 bg-[#f7f2e8] shadow-[0_18px_45px_-36px_rgba(23,33,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#a98650]/50 hover:shadow-[0_26px_55px_-34px_rgba(23,33,42,0.48)]">
        <div className="flex min-h-[330px] flex-col items-center justify-center px-7 py-9 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#a98650]/20 bg-white text-[#9a6d2c] shadow-sm">
            <CircleAlert size={24} />
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#9a6d2c]">
            Organize your home
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            Needs a Room
          </h3>

          <p className="mt-2 max-w-[240px] text-sm leading-6 text-text-secondary">
            {room.deviceCount}{" "}
            {room.deviceCount === 1
              ? "thing isn’t assigned to a room yet."
              : "things aren’t assigned to a room yet."}
          </p>

          <Link
            href={
              room.id
                ? `/home/rooms/${room.id}`
                : `/devices?search=${encodeURIComponent(room.name)}`
            }
            className="mt-6 inline-flex items-center gap-2 rounded-full !bg-[#20384b] px-5 py-2.5 text-sm font-semibold !text-white shadow-md transition hover:-translate-y-0.5 hover:!bg-[#172b3a]"
          >
            Organize them
            <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#fbfaf7] shadow-[0_20px_50px_-38px_rgba(23,33,42,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_65px_-36px_rgba(23,33,42,0.58)]">
      <div className="overflow-hidden">
        <div
          className={[
            room.coverImageUrl
              ? "relative min-h-[170px] overflow-hidden"
              : "relative min-h-[105px] overflow-hidden",
            visualClass,
          ].join(" ")}
        >
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
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #e5ebe4 0%, #f3efe6 56%, #e8dfd2 100%)",
                }}
              />

              <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/65 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-14 h-44 w-44 rounded-full border border-[#617c43]/15" />

              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[#20384b]/5" />
            </>
          )}

          <div
            className={[
              "relative flex items-start justify-between gap-4",
              room.coverImageUrl ? "p-6" : "px-6 py-5",
            ].join(" ")}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-[#20384b] shadow-sm backdrop-blur-md">
              <Icon size={22} />
            </div>

            <RoomStatusBadge completeness={room.completeness} />
          </div>
        </div>

        <div
          className={[
            "px-6 py-4",
            room.coverImageUrl
              ? "bg-[#172b3a]"
              : "border-t border-[#182533]/8 bg-[#fbfaf7]",
          ].join(" ")}
        >
          <p
            className={[
              "text-[9px] font-bold uppercase tracking-[0.17em]",
              room.coverImageUrl ? "text-white/55" : "text-[#617078]",
            ].join(" ")}
          >
            In your home
          </p>

          <h3
            className={[
              "mt-1.5 text-[1.45rem] font-semibold tracking-[-0.04em]",
              room.coverImageUrl ? "text-white" : "text-[#13232f]",
            ].join(" ")}
          >
            {room.name}
          </h3>

          <p
            className={[
              "mt-1.5 inline-flex items-center gap-2 text-sm font-medium",
              room.coverImageUrl ? "text-white/70" : "text-[#617078]",
            ].join(" ")}
          >
            <MapPin size={14} />
            {room.deviceCount}{" "}
            {room.deviceCount === 1 ? "thing remembered" : "things remembered"}
          </p>

          {canEdit && room.id ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label
                className={[
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  room.coverImageUrl
                    ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                    : "border-[#617c43]/20 bg-[#edf2e8] text-[#20384b] shadow-sm hover:bg-[#e4ebde]",
                ].join(" ")}
              >
                {savingCover ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ImageIcon size={14} />
                )}

                {savingCover
                  ? "Saving..."
                  : room.coverImageUrl
                    ? "Change photo"
                    : "Add photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={savingCover}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file && onCoverChange) {
                      void onCoverChange(room, file);
                    }

                    event.currentTarget.value = "";
                  }}
                />
              </label>

              {room.coverImageUrl && room.coverImagePath && onRemoveCover ? (
                <button
                  type="button"
                  disabled={savingCover}
                  onClick={() => void onRemoveCover(room)}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          ) : null}
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

              <ArrowRight
                size={14}
                className="shrink-0 text-text-tertiary transition group-hover/device:translate-x-0.5 group-hover/device:text-text-primary"
              />
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6d2c] transition hover:text-[#20384b]"
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
