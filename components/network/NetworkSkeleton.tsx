export function NetworkPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card" />

      <div className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card" />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card"
          />
        ))}
      </section>

      <div className="h-44 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card" />

      <section className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card"
          />
        ))}
      </section>
    </div>
  );
}

export function NetworkMetricSkeleton() {
  return (
    <div className="h-16 animate-pulse rounded-[20px] bg-surface-sunken" />
  );
}
