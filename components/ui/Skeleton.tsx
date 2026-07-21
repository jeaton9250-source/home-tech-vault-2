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
        "animate-pulse rounded-[var(--radius-button)] bg-surface-sunken",
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

export function SkeletonCard() {
  return (
    <div className="htv-card p-6">
      <Skeleton className="h-4 w-24" />

      <Skeleton className="mt-4 h-8 w-40" />

      <SkeletonText
        lines={2}
        className="mt-4"
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="htv-card p-8">
        <Skeleton className="h-4 w-32" />

        <Skeleton className="mt-4 h-12 w-80 max-w-full" />

        <Skeleton className="mt-3 h-4 w-64" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />

        <SkeletonCard />
      </div>

      <SkeletonCard />

      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard />

        <SkeletonCard />
      </div>
    </div>
  );
}
