"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { cn } from "@/lib/design-system/cn";
import { createFaqJsonLd } from "@/lib/seo/jsonLd";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

type FaqProps = {
  items: ReadonlyArray<SeoFaqItem>;
  title?: string;
  description?: string;
  className?: string;
  /** Emit FAQPage JSON-LD (default true) */
  includeJsonLd?: boolean;
};

/**
 * Reusable FAQ accordion for marketing/content pages.
 * Emits FAQPage JSON-LD by default.
 */
export default function Faq({
  items,
  title = "Frequently asked questions",
  description,
  className,
  includeJsonLd = true,
}: FaqProps) {
  const baseId = useId();
  const [openQuestion, setOpenQuestion] = useState<
    string | null
  >(items[0]?.question ?? null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full", className)}>
      {includeJsonLd ? (
        <StructuredData
          id={`${baseId}-faq-jsonld`}
          data={createFaqJsonLd(items)}
        />
      ) : null}

      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 text-base leading-7 text-text-muted">
            {description}
          </p>
        ) : null}

        <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
          {items.map((item, index) => {
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const isOpen = openQuestion === item.question;

            return (
              <div key={item.question} className="py-1">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="htv-focus-ring flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-text-primary"
                    onClick={() =>
                      setOpenQuestion(
                        isOpen ? null : item.question
                      )
                    }
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-text-muted transition",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-4 text-base leading-7 text-text-muted"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
