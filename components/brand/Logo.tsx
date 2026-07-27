import { cn } from "@/lib/design-system/cn";

type LogoProps = {
  collapsed?: boolean;
  withMark?: boolean;
  className?: string;
};

export default function Logo({
  collapsed = false,
  withMark = false,
  className,
}: LogoProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        className
      )}
    >
      {withMark ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[12px] border border-border-subtle bg-surface-card text-[0.625rem] font-semibold text-text-primary shadow-[var(--shadow-inset)]",
            collapsed ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          HT
        </span>
      ) : null}

      <p
        className={cn(
          "min-w-0 truncate font-medium normal-case tracking-normal text-text-primary",
          collapsed
            ? "text-[0.875rem]"
            : "text-sm md:text-[0.9375rem]"
        )}
      >
        Home Tech Vault
      </p>
    </div>
  );
}
