import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  overline?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  overline = "Platform Admin",
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="htv-hero-band overflow-hidden shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-8 md:flex-row md:items-end md:justify-between md:px-10 md:py-10">
        <div>
          <p className="text-overline text-charcoal-soft">
            {overline}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
              {description}
            </p>
          )}
        </div>

        {actions ? (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
