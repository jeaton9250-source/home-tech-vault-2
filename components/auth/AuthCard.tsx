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
    <div className="w-full max-w-[440px] rounded-[28px] border border-border-subtle bg-white p-6 shadow-[var(--shadow-sm),var(--shadow-md),var(--shadow-inset)] md:p-8">
      {overline ? (
        <p className="text-overline text-interaction">
          {overline}
        </p>
      ) : null}

      <h1 className="mt-2 text-[clamp(1.75rem,4vw,2rem)] font-medium tracking-[-0.03em] text-text-primary">
        {title}
      </h1>

      {description ? (
        <p className="mt-3 text-[0.9375rem] leading-7 text-text-muted">
          {description}
        </p>
      ) : null}

      <div className="mt-7">{children}</div>
    </div>
  );
}
