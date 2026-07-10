import { ReactNode } from "react";

type StatusBadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "gold";

type StatusBadgeProps = {
  children: ReactNode;
  variant?: StatusBadgeVariant;
};

const variants: Record<StatusBadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  gold: "bg-[#F3EAD7] text-[#8A6A2F]",
};

export default function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}