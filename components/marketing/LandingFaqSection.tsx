"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { FAQ_ITEMS } from "@/lib/marketing/faq";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const landingFaqItems = FAQ_ITEMS.slice(0, 6);

export default function LandingFaqSection() {
  const [openQuestion, setOpenQuestion] =
    useState<string | null>(
      landingFaqItems[0]?.question ?? null
    );

  return (
    <MarketingContent
      id="faq"
      className="scroll-mt-24"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-center"
        >
          <p className="text-overline text-text-muted">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Quick answers about accounts, devices,
            privacy, and getting started.
          </p>
        </motion.div>

        <div className="mt-10 space-y-3">
          {landingFaqItems.map((item) => {
            const isOpen =
              openQuestion ===
              item.question;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)]"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenQuestion(
                        isOpen
                          ? null
                          : item.question
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-interaction md:px-6 md:text-base"
                  >
                    {item.question}
                    <ChevronDown
                      size={18}
                      aria-hidden
                      className={cn(
                        "shrink-0 text-text-muted transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </h3>

                {isOpen ? (
                  <div className="border-t border-border-subtle px-5 py-4 text-sm leading-7 text-text-muted md:px-6">
                    {item.answer}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          Need more detail?{" "}
          <Link
            href={MARKETING_ROUTES.faq}
            className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Browse the full FAQ
          </Link>
        </p>
      </div>
    </MarketingContent>
  );
}
