import type { ReactNode } from "react";

type AuthCardProps = {
  overline?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function AuthCard({
  overline,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[440px] rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm),var(--shadow-md)] md:p-8">
      {overline ? (
        <p className="text-overline text-interaction">
          {overline}
        </p>
      ) : null}

      <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-[1.75rem]">
        {title}
      </h1>

      {description ? (
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {description}
        </p>
      ) : null}

      <div className="mt-7">{children}</div>
    </div>
  );
}
