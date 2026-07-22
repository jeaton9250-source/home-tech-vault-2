export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <div className="h-48 animate-pulse rounded-[28px] border border-border-subtle bg-surface-card" />
      <div className="h-56 animate-pulse rounded-[24px] border border-border-subtle bg-surface-card" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[24px] border border-border-subtle bg-surface-card"
            />
          )
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[24px] border border-border-subtle bg-surface-card" />
        <div className="h-64 animate-pulse rounded-[24px] border border-border-subtle bg-surface-card" />
      </div>
    </div>
  );
}
