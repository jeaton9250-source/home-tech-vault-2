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
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
      <p className="text-sm text-text-secondary">{title}</p>

      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950">
        {value}
      </h2>

      <p className="mt-2 text-sm text-text-tertiary">{description}</p>
    </div>
  );
}