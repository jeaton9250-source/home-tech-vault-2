type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <p className="text-sm text-text-secondary">
        {title}
      </p>

      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
        {value}
      </h2>

      <p className="mt-2 text-sm text-text-tertiary">
        {description}
      </p>
    </div>
  );
}
