"use client";

import {
  useState,
  type CSSProperties,
} from "react";

import Image from "next/image";

import { cn } from "@/lib/design-system/cn";
import {
  getCategoryFallbackIcon,
  resolveDeviceImage,
  type DeviceImageInput,
} from "@/lib/devices/getDeviceImage";
import { sections } from "@/lib/design-system/tokens";

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
    aspect: "aspect-[4/3]",
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
  const FallbackIcon =
    getCategoryFallbackIcon(
      device.category
    );
  const tech = sections.technology;

  const showImage =
    Boolean(resolved.src) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-sunken",
        styles.aspect,
        className
      )}
    >
      {showImage ? (
        <Image
          src={resolved.src!}
          alt={resolved.alt}
          fill
          priority={priority}
          sizes={styles.sizes}
          unoptimized={
            resolved.isDemoAsset ||
            resolved.src!.startsWith("http")
          }
          className={cn(
            resolved.isDemoAsset ||
              styles.containDemo
              ? "object-contain p-4 md:p-6"
              : "object-cover",
            "transition duration-500",
            imageClassName
          )}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center"
          style={
            {
              background: tech.soft,
              color: tech.accent,
            } as CSSProperties
          }
          aria-hidden={variant === "thumbnail"}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)]">
            <FallbackIcon size={28} />
          </div>

          {variant !== "thumbnail" && (
            <p className="mt-3 text-xs font-medium text-text-tertiary">
              {device.category ||
                "Device"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
