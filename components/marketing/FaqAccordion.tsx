"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
} from "@/lib/marketing/faq";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

export default function FaqAccordion() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<FaqCategory | "All">("All");
  const [openQuestion, setOpenQuestion] =
    useState<string | null>(
      FAQ_ITEMS[0]?.question ?? null
    );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const haystack =
        `${item.question} ${item.answer} ${item.category}`.toLowerCase();

      return (
        matchesCategory &&
        haystack.includes(normalizedQuery)
      );
    });
  }, [activeCategory, query]);

  return (
    <>
      <MarketingPageHero
        eyebrow="FAQ"
        title="Questions, answered simply."
        description="Search by topic or browse common questions about accounts, devices, privacy, and billing."
      />

      <MarketingContent className="pt-0">
        <div className="mx-auto max-w-3xl">
          <label
            htmlFor="faq-search"
            className="sr-only"
          >
            Search FAQ
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden
            />

            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search questions..."
              className="w-full rounded-[var(--radius-button)] border border-border-subtle bg-surface-card py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-interaction focus:ring-2 focus:ring-interaction/20"
            />
          </div>

          <div
            className="mt-4 flex flex-wrap gap-2"
            role="tablist"
            aria-label="FAQ categories"
          >
            <CategoryChip
              label="All"
              active={activeCategory === "All"}
              onClick={() =>
                setActiveCategory("All")
              }
            />

            {FAQ_CATEGORIES.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                active={
                  activeCategory === category
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              />
            ))}
          </div>

          <div className="mt-8 divide-y divide-border-subtle rounded-[var(--radius-card)] border border-border-subtle bg-surface-card">
            {filteredItems.length === 0 ? (
              <p className="px-6 py-8 text-sm text-text-muted">
                No questions match your search. Try
                another keyword or{" "}
                <Link
                  href={MARKETING_ROUTES.contact}
                  className="font-medium text-interaction hover:text-interaction-hover"
                >
                  contact us
                </Link>
                .
              </p>
            ) : (
              filteredItems.map((item) => {
                const isOpen =
                  openQuestion === item.question;
                const panelId = `faq-${item.question.replace(/\W+/g, "-").toLowerCase()}`;

                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-surface-sunken/50"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenQuestion(
                          isOpen
                            ? null
                            : item.question
                        )
                      }
                    >
                      <span>
                        <span className="text-overline text-text-muted">
                          {item.category}
                        </span>
                        <span className="mt-1 block text-base font-medium">
                          {item.question}
                        </span>
                      </span>

                      <ChevronDown
                        size={18}
                        className={cn(
                          "shrink-0 text-text-muted transition",
                          isOpen && "rotate-180"
                        )}
                        aria-hidden
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        className="px-6 pb-5 text-sm leading-7 text-text-muted"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-10 text-center text-sm text-text-muted">
            Still curious?{" "}
            <Link
              href={MARKETING_ROUTES.contact}
              className="font-medium text-interaction hover:text-interaction-hover"
            >
              Contact us
            </Link>{" "}
            or{" "}
            <Link
              href={MARKETING_ROUTES.demo}
              className="font-medium text-interaction hover:text-interaction-hover"
            >
              explore the demo
            </Link>
            .
          </p>
        </div>
      </MarketingContent>
    </>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "bg-charcoal text-surface-card"
          : "border border-border-subtle text-text-muted hover:bg-surface-hover"
      )}
    >
      {label}
    </button>
  );
}
