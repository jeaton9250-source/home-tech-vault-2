import PageCard from "@/components/ui/PageCard";

type AdminPanelProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function AdminPanel({
  title,
  children,
  className = "",
}: AdminPanelProps) {
  return (
    <PageCard className={`p-5 md:p-6 ${className}`}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </PageCard>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-border-subtle bg-surface-sunken px-5 py-8 text-center">
      <p className="font-semibold text-text-primary">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

export function formatAdminDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}
