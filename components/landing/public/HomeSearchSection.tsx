"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PUBLIC_SECTION_IDS,
  LANDING_SEARCH,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeSearchSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.search}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className={landingTheme.eyebrow}>
            {LANDING_SEARCH.eyebrow}
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            {LANDING_SEARCH.title}
          </h2>
          <p className={cn(landingTheme.body, "mx-auto mt-4 max-w-2xl text-text-muted")}>
            {LANDING_SEARCH.text}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="htv-glass-card-elevated mx-auto mt-10 max-w-3xl p-6 sm:p-8 rounded-[32px] border border-border-subtle bg-surface-card shadow-lift"
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-sunken/60 px-4 py-4 shadow-inner">
            <Search
              size={18}
              className="shrink-0 text-text-muted"
              aria-hidden
            />
            <p className="text-sm font-medium text-text-primary">
              Ask your home anything in plain English...
            </p>
            <span className="ml-auto hidden sm:flex items-center gap-1 text-xs font-semibold text-premium bg-premium-soft px-3 py-1 rounded-full">
              <Sparkles size={13} /> Smart Search
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted text-center mb-3">
              Try asking questions like:
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {LANDING_SEARCH.examples.map((example) => (
                <span
                  key={example}
                  className="rounded-full border border-border-subtle/80 bg-surface-card px-4 py-2 text-xs sm:text-sm font-medium text-text-primary shadow-sm hover:border-home-health/40 transition-colors"
                >
                  &quot;{example}&quot;
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
