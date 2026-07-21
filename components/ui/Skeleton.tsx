import { cn } from "@/lib/design-system/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-button)] bg-surface-sunken motion-reduce:animate-none",
        className
      )}
      aria-hidden
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map(
        (_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "h-4",
              index === lines - 1
                ? "w-2/3"
                : "w-full"
            )}
          />
        )
      )}
    </div>
  );
}

export function SkeletonCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-40" />
      <SkeletonText
        lines={2}
        className="mt-4"
      />
    </div>
  );
}

export function SkeletonList({
  items = 4,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card p-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-[var(--radius-button)]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function SkeletonPageHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-64 max-w-full" />
      <Skeleton className="mt-4 h-4 w-80 max-w-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-8 md:space-y-10"
      aria-busy
      aria-label="Loading dashboard"
    >
      <SkeletonPageHeader />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <SkeletonCard />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <SkeletonCard key={index} />
          )
        )}
      </div>

      <SkeletonList items={3} />
    </div>
  );
}

export const LoadingSkeleton = {
  Base: Skeleton,
  Text: SkeletonText,
  Card: SkeletonCard,
  List: SkeletonList,
  PageHeader: SkeletonPageHeader,
  Dashboard: DashboardSkeleton,
};

export default LoadingSkeleton;
