import { cn } from "@/lib/design-system/cn";

import { brand } from "@/lib/design-system/tokens";

type LogoProps = {
  collapsed?: boolean;
  className?: string;
};

export default function Logo({
  collapsed = false,
  className,
}: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-charcoal text-sm font-semibold text-surface-card shadow-sm">
        HT
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {brand.name}
          </p>

          <p className="truncate text-xs text-text-tertiary">
            {brand.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
