"use client";

import { motion } from "framer-motion";
import { Radar, ShieldCheck, Sparkles, Wifi } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PROBLEM_CARDS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

const iconMap = {
  wifi: Wifi,
  shield: ShieldCheck,
  pulse: Sparkles,
  radar: Radar,
} as const;

export default function ProblemSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.problems}
      className={cn(
        "bg-surface-sunken/40 px-5 py-20 md:px-8 md:py-28 lg:px-12 border-y border-border-subtle/50",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-3xl">
          <p className={landingTheme.eyebrow}>
            The Modern Home Dilemma
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Most homeowners don&apos;t know what is actually happening in their home.
          </h2>
          <p className={cn(landingTheme.body, "mt-4 max-w-2xl")}>
            Technology has filled every room—smart TVs, mesh networks, appliances, and audio systems—yet managing it remains fragmented across drawers, lost emails, and mental checklists.
          </p>
        </div>

        {/* 4 Core Problem Pillars */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_PROBLEM_CARDS.map((card, idx) => {
            const Icon = iconMap[card.icon];

            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                className={cn(
                  landingTheme.cardSoft,
                  "htv-card-interactive flex flex-col justify-between p-6 md:p-7 border border-border-subtle/80 bg-surface-card shadow-sm rounded-3xl"
                )}
              >
                <div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-sunken text-text-primary shadow-inner">
                    <Icon size={20} aria-hidden />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-text-primary tracking-tight">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-6 text-text-muted">
                    {card.text}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
