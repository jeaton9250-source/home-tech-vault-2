import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

/** @deprecated Prefer PageHero or PageTitle from components/ui. */
export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-page-title font-medium tracking-[-0.03em] text-text-primary">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          {description}
        </p>
      </div>

      {action ? <div>{action}</div> : null}
    </div>
  );
}
