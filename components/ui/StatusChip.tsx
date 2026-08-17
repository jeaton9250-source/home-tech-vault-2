import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

export { default as Badge } from "@/components/ui/Badge";

type StatusChipVariant =
  | "neutral"
  | "accent"
  | "premium"
  | "success"
  | "warning"
  | "danger";

type StatusChipProps = {
  children: ReactNode;
  variant?: StatusChipVariant;
  dot?: boolean;
  className?: string;
};

const variants: Record<
  StatusChipVariant,
  { chip: string; dot: string }
> = {
  neutral: {
    chip:
      "border border-[#182533]/10 bg-[#182533]/5 text-[#66727a]",
    dot:
      "bg-[#879198]",
  },

  accent: {
    chip:
      "border border-[#617c43]/15 bg-[#617c43]/10 text-[#526b39]",
    dot:
      "bg-[#617c43]",
  },

  premium: {
    chip:
      "border border-[#a38748]/20 bg-[#a38748]/10 text-[#80682f]",
    dot:
      "bg-[#a38748]",
  },

  success: {
    chip:
      "border border-[#617c43]/15 bg-[#617c43]/10 text-[#526b39]",
    dot:
      "bg-[#617c43]",
  },

  warning: {
    chip:
      "border border-[#b58a42]/20 bg-[#b58a42]/10 text-[#916c31]",
    dot:
      "bg-[#b58a42]",
  },

  danger: {
    chip:
      "border border-[#a6584e]/20 bg-[#a6584e]/10 text-[#984e46]",
    dot:
      "bg-[#a6584e]",
  },
};

export default function StatusChip({
  children,
  variant = "neutral",
  dot = true,
  className,
}: StatusChipProps) {
  const styles =
    variants[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles.chip,
        className
      )}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            styles.dot
          )}
        />
      ) : null}

      {children}
    </span>
  );
}