"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_ADVISOR,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeAdvisorStorySection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.advisor}
      className={cn(
        "bg-surface-sunken/30 px-5 py-20 md:px-8 md:py-28 lg:px-12 border-y border-border-subtle/50",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className={landingTheme.eyebrow}>
              {LANDING_ADVISOR.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_ADVISOR.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl text-text-muted")}>
              {LANDING_ADVISOR.text}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="htv-glass-card-elevated space-y-4 p-6 sm:p-8 rounded-[32px] border border-border-subtle bg-surface-card shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle/60 pb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-premium-soft text-premium font-bold shadow-sm">
                <Sparkles size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Home Advisor
                </p>
                <p className="text-xs text-text-muted">
                  Proactive intelligence &amp; recommendations
                </p>
              </div>
            </div>

            {LANDING_ADVISOR.items.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border-subtle/80 bg-surface-sunken/40 p-4 transition-all hover:translate-x-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-home-health-soft text-home-health mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-card border border-border-subtle px-2.5 py-0.5 text-[10px] font-semibold text-text-primary">
                    {item.action}
                  </span>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
