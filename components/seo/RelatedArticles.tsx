import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export type RelatedArticle = {
  title: string;
  description?: string;
  href: string;
};

type RelatedArticlesProps = {
  articles: ReadonlyArray<RelatedArticle>;
  title?: string;
  className?: string;
};

/**
 * Related content links for SEO internal linking.
 */
export default function RelatedArticles({
  articles,
  title = "Related reading",
  className,
}: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full", className)}>
      <h2 className="text-xl font-medium tracking-[-0.02em] text-text-primary md:text-2xl">
        {title}
      </h2>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="htv-focus-ring group flex h-full flex-col border border-border-subtle bg-surface-card p-5 transition hover:border-border-strong"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-base font-medium text-text-primary">
                  {article.title}
                </span>
                <ArrowUpRight
                  size={16}
                  className="mt-1 shrink-0 text-text-muted transition group-hover:text-text-primary"
                  aria-hidden
                />
              </span>

              {article.description ? (
                <span className="mt-2 text-sm leading-6 text-text-muted">
                  {article.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
