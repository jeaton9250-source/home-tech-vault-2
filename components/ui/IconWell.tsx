import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

import {
  sections,
} from "@/lib/design-system/tokens";

type IconWellSection =
  keyof typeof sections;

type IconWellProps = {
  icon: LucideIcon;
  section?: IconWellSection;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 [&_svg]:size-4",
  md: "h-10 w-10 [&_svg]:size-[18px]",
  lg: "h-12 w-12 [&_svg]:size-5",
};

export default function IconWell({
  icon: Icon,
  section = "technology",
  size = "md",
  className,
}: IconWellProps) {
  const tint = sections[section];

  return (
    <div
      className={cn(
        "htv-icon-well flex shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle",
        sizeClasses[size],
        className
      )}
      style={{
        background: tint.soft,
        color: tint.accent,
      }}
    >
      <Icon />
    </div>
  );
}

export type { IconWellSection };
