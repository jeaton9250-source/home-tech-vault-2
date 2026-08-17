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
      <div className="flex items-center gap-3">
        <span className="h-px w-6 bg-[#617c43]" />
        <h2 className="font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a] md:text-3xl">
          {title}
        </h2>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="htv-focus-ring group flex h-full flex-col rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.4)] transition hover:-translate-y-0.5 hover:border-[#617c43]/30 hover:shadow-[0_22px_45px_-34px_rgba(15,25,35,0.5)]"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-serif text-base font-medium leading-6 text-[#17212a]">
                  {article.title}
                </span>
                <ArrowUpRight
                  size={16}
                  className="mt-1 shrink-0 text-[#617c43] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>

              {article.description ? (
                <span className="mt-2 text-sm leading-6 text-[#68737b]">
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
