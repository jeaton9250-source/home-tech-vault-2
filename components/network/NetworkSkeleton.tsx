import PageCard from "@/components/ui/PageCard";

export function NetworkPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageCard className="p-7">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-sunken" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-surface-sunken" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-sunken" />
        </div>
      </PageCard>
      <PageCard className="p-7">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-[20px] bg-surface-sunken"
            />
          ))}
        </div>
      </PageCard>
    </div>
  );
}

export function NetworkMetricSkeleton() {
  return (
    <div className="h-16 animate-pulse rounded-[20px] bg-surface-sunken" />
  );
}
