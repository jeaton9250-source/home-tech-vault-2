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
    <div className="space-y-8 md:space-y-10">
      <div className="htv-command-hero p-8 md:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl flex-1">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="mt-4 h-12 w-80 max-w-full" />
            <Skeleton className="mt-3 h-5 w-48" />
            <SkeletonText
              lines={2}
              className="mt-5"
            />
          </div>

          <Skeleton className="mx-auto h-[280px] w-[280px] rounded-[28px] xl:mx-0" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <SkeletonCard key={index} />
          )
        )}
      </div>

      <SkeletonCard />

      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <SkeletonCard />

      <SkeletonCard />
    </div>
  );
}
