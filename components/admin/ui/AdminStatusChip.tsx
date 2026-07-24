"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

export type AdminStatusChipTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

const TONE_STYLES: Record<
  AdminStatusChipTone,
  string
> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900",
  danger:
    "border-rose-200 bg-rose-50 text-rose-800",
  neutral:
    "border-border-subtle bg-surface-sunken text-text-secondary",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export default function AdminStatusChip({
  tone = "neutral",
  children,
  dot = true,
}: {
  tone?: AdminStatusChipTone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone]
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-emerald-500",
            tone === "warning" && "bg-amber-500",
            tone === "danger" && "bg-rose-500",
            tone === "neutral" && "bg-text-tertiary",
            tone === "info" && "bg-sky-500"
          )}
        />
      ) : null}
      {children}
    </span>
  );
}

export function userStatusChipTone(
  status:
    | "active"
    | "invited"
    | "never_logged_in"
    | "suspended"
    | "pending"
    | "expired"
): AdminStatusChipTone {
  switch (status) {
    case "active":
      return "success";
    case "invited":
    case "pending":
      return "warning";
    case "never_logged_in":
      return "neutral";
    case "suspended":
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
}
