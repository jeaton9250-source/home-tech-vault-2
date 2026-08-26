import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

type TableOfContentsItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: ReadonlyArray<TableOfContentsItem>;
  title?: string;
  className?: string;
};

export default function TableOfContents({
  items,
  title = "On this page",
  className,
}: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "border border-border-subtle bg-surface-card p-5",
        className
      )}
    >
      <p className="text-overline text-text-muted">
        {title}
      </p>
      <ol className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="htv-focus-ring text-sm leading-6 text-text-secondary transition hover:text-text-primary"
            >
              <span className="mr-2 text-text-muted">
                {index + 1}.
              </span>
              {item.label.replace(/^\d+\.\s*/, "")}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type { TableOfContentsItem, TableOfContentsProps };
