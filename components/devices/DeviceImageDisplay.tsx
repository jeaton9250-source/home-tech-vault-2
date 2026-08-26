"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import Image from "next/image";

import {
  Camera,
  Gamepad2,
  HardDrive,
  Laptop,
  Printer,
  Router,
  Smartphone,
  Tv,
  Wifi,
} from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import {
  resolveDeviceImage,
  type DeviceImageInput,
} from "@/lib/devices/getDeviceImage";
import { sections } from "@/lib/design-system/tokens";

function CategoryFallbackIcon({
  category,
  size,
}: {
  category?: string | null;
  size: number;
}) {
  const normalized =
    category?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("computer") ||
    normalized.includes("laptop") ||
    normalized.includes("monitor")
  ) {
    return <Laptop size={size} />;
  }

  if (
    normalized.includes("television") ||
    normalized === "tv"
  ) {
    return <Tv size={size} />;
  }

  if (
    normalized.includes("router") ||
    normalized.includes("network")
  ) {
    return <Router size={size} />;
  }

  if (normalized.includes("printer")) {
    return <Printer size={size} />;
  }

  if (
    normalized.includes("game") ||
    normalized.includes("gaming") ||
    normalized.includes("console")
  ) {
    return <Gamepad2 size={size} />;
  }

  if (
    normalized.includes("mobile") ||
    normalized.includes("phone") ||
    normalized.includes("tablet")
  ) {
    return <Smartphone size={size} />;
  }

  if (
    normalized.includes("camera") ||
    normalized.includes("security") ||
    normalized.includes("doorbell")
  ) {
    return <Camera size={size} />;
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("nas")
  ) {
    return <HardDrive size={size} />;
  }

  if (
    normalized.includes("stream") ||
    normalized.includes("wifi") ||
    normalized.includes("smart home")
  ) {
    return <Wifi size={size} />;
  }

  return <Laptop size={size} />;
}

type DeviceImageVariant =
  | "card"
  | "hero"
  | "thumbnail"
  | "room";

type DeviceImageDisplayProps = {
  device: DeviceImageInput;
  variant?: DeviceImageVariant;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

const variantStyles: Record<
  DeviceImageVariant,
  {
    aspect: string;
    sizes: string;
    containDemo: boolean;
  }
> = {
  card: {
    aspect: "aspect-[16/9]",
    sizes:
      "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw",
    containDemo: true,
  },
  hero: {
    aspect: "aspect-[5/4]",
    sizes:
      "(max-width: 1280px) 100vw, 60vw",
    containDemo: true,
  },
  thumbnail: {
    aspect: "aspect-square",
    sizes: "80px",
    containDemo: true,
  },
  room: {
    aspect: "aspect-[4/3]",
    sizes:
      "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw",
    containDemo: true,
  },
};

export default function DeviceImageDisplay({
  device,
  variant = "card",
  priority = false,
  className,
  imageClassName,
}: DeviceImageDisplayProps) {
  const [failed, setFailed] =
    useState(false);

  const resolved = resolveDeviceImage(
    device
  );
  const styles = variantStyles[variant];
  const tech = sections.technology;

  const showImage =
    Boolean(resolved.src) && !failed;
  const isDemoAsset = resolved.isDemoAsset;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant === "card"
          ? "bg-[#f7f6f2]"
          : isDemoAsset
            ? "bg-[#F3F1EC]"
            : "bg-surface-sunken",
        styles.aspect,
        className
      )}
    >
      {isDemoAsset && showImage && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FAF9F7]/40 via-transparent to-[#E7E2DA]/60"
          aria-hidden
        />
      )}

      {showImage ? (
        <Image
          src={resolved.src!}
          alt={resolved.alt}
          fill
          priority={priority}
          sizes={styles.sizes}
          unoptimized={
            isDemoAsset ||
            resolved.src!.startsWith("http")
          }
          className={cn(
            isDemoAsset
              ? cn(
                  "object-cover object-center",
                  variant === "thumbnail"
                    ? "scale-110"
                    : "scale-[1.03]"
                )
              : styles.containDemo
                ? variant === "card"
                  ? "object-contain p-8 md:p-10"
                  : "object-contain p-4 md:p-6"
                : "object-cover",
            "transition duration-500",
            imageClassName
          )}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={
            variant === "card"
              ? "flex h-full w-full items-center justify-center bg-[#f7f6f2]"
              : "flex h-full w-full flex-col items-center justify-center"
          }
          style={
            variant === "card"
              ? ({
                  color:
                    tech.accent,
                } as CSSProperties)
              : ({
                  background:
                    tech.soft,
                  color:
                    tech.accent,
                } as CSSProperties)
          }
          aria-hidden={
            variant ===
            "thumbnail"
          }
        >
          <div
            className={
              variant === "card"
                ? "flex h-[92px] w-[92px] items-center justify-center text-[#183047]"
                : "flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)]"
            }
          >
            <CategoryFallbackIcon
              category={
                device.category
              }
              size={
                variant ===
                "card"
                  ? 42
                  : 28
              }
            />
          </div>

          {variant !== "thumbnail" &&
          variant !== "card" ? (
            <p className="mt-3 text-xs font-medium text-text-tertiary">
              {device.category ||
                "Device"}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
