"use client";

import Link from "next/link";

import Badge from "@/components/ui/Badge";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export function NavLink({
  href,
  label,
  isActive,
  badge,
  onClick,
  compact = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string | null;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-200",
        compact
          ? "px-3 py-1.5 text-xs lg:px-3.5 lg:text-[0.8125rem]"
          : "px-3.5 py-2 text-xs lg:text-sm",
        isActive
          ? "bg-[#617c43] text-white shadow-[0_8px_20px_-12px_rgba(97,124,67,0.95)]"
          : "text-[#c5cdd3] hover:bg-white/[0.07] hover:text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}

      {badge ? (
        <Badge
          variant="premium"
          className={cn(
            "ml-0.5",
            isActive &&
              "border-white/15 bg-white/15 text-white"
          )}
        >
          {badge}
        </Badge>
      ) : null}
    </Link>
  );
}

export function MobileNavLink({
  href,
  label,
  isActive,
  badge,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string | null;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
        isActive
          ? "border border-[#718d4f]/30 bg-[#617c43] text-white shadow-[0_10px_24px_-16px_rgba(97,124,67,0.9)]"
          : "border border-transparent text-[#c6ced4] hover:bg-white/[0.05] hover:text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {Icon ? (
        <Icon
          size={18}
          aria-hidden
          className={
            isActive
              ? "text-white"
              : "text-[#718d4f]"
          }
        />
      ) : null}

      <span className="flex-1">
        {label}
      </span>

      {badge ? (
        <Badge
          variant="premium"
          className={
            isActive
              ? "border-white/15 bg-white/15 text-white"
              : undefined
          }
        >
          {badge}
        </Badge>
      ) : null}
    </Link>
  );
}