"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import PageCard from "@/components/ui/PageCard";
import { cn } from "@/lib/design-system/cn";
import type {
  HomeHealthCardStatus,
  HomeHealthCategoryCard,
} from "@/lib/home-health/types";

type HomeHealthCategoryGridProps = {
  cards: HomeHealthCategoryCard[];
};

const statusStyles: Record<
  HomeHealthCardStatus,
  string
> = {
  healthy:
    "border-home-health/20 bg-home-health-soft text-home-health",
  attention:
    "border-warning/20 bg-warning-soft text-warning",
  incomplete:
    "border-border-subtle bg-surface-sunken text-text-muted",
};

const statusLabels: Record<
  HomeHealthCardStatus,
  string
> = {
  healthy: "Healthy",
  attention: "Attention",
  incomplete: "Incomplete",
};

export default function HomeHealthCategoryGrid({
  cards,
}: HomeHealthCategoryGridProps) {
  return (
    <section aria-label="Home health categories">
      <div className="mb-5">
        <p className="text-overline text-text-muted">
          Your home
        </p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em] text-text-primary">
          Health by area
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={card.href}
              className="block h-full"
            >
              <PageCard
                interactive
                className="h-full bg-surface-card transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                    {card.title}
                  </h3>

                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
                      statusStyles[card.status]
                    )}
                  >
                    {
                      statusLabels[
                        card.status
                      ]
                    }
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-[var(--ease-premium)]",
                      card.status === "healthy"
                        ? "bg-home-health"
                        : card.status ===
                            "attention"
                          ? "bg-warning"
                          : "bg-border-strong"
                    )}
                    style={{
                      width: `${card.progress}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-sm leading-7 text-text-muted">
                  {card.summary}
                </p>
              </PageCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
