import { cn } from "@/lib/design-system/cn";

import { brand } from "@/lib/design-system/tokens";

type LogoProps = {
  collapsed?: boolean;
  className?: string;
};

function WordmarkMark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "h-8 w-8 shrink-0 text-charcoal",
        className
      )}
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="var(--color-surface-card)"
        stroke="var(--color-border-subtle)"
        strokeWidth="1"
      />
      <path
        d="M16 8.5L23.5 14.5V22.5C23.5 23.05 23.05 23.5 22.5 23.5H9.5C8.95 23.5 8.5 23.05 8.5 22.5V14.5L16 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 23.5V17.5H18.5V23.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle
        cx="16"
        cy="14.5"
        r="1.25"
        fill="var(--color-interaction)"
      />
    </svg>
  );
}

export default function Logo({
  collapsed = false,
  className,
}: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        className
      )}
    >
      <WordmarkMark />

      <div className="min-w-0">
        <p className="truncate text-[0.9375rem] font-semibold tracking-[-0.02em] text-text-primary">
          {brand.name}
        </p>

        {!collapsed && (
          <p className="truncate text-xs text-text-tertiary">
            {brand.tagline}
          </p>
        )}
      </div>
    </div>
  );
}
