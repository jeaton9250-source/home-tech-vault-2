"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Wifi } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_HOME_HEALTH,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeHealthPreviewSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.homeHealth}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* Section Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className={landingTheme.eyebrow}>
              {LANDING_HOME_HEALTH.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_HOME_HEALTH.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl text-text-muted")}>
              {LANDING_HOME_HEALTH.text}
            </p>
          </motion.div>

          {/* Calm Home Pulse Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="htv-glass-card-elevated overflow-hidden p-7 sm:p-9 border border-border-subtle shadow-lift rounded-[32px] bg-surface-card"
          >
            {/* Header Greeting */}
            <div className="flex items-center justify-between border-b border-border-subtle/60 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Daily Home Pulse
                </p>
                <h3 className="text-lg font-semibold text-text-primary mt-0.5">
                  Sample Home
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-home-health-soft px-3 py-1 text-xs font-semibold text-home-health border border-home-health/20">
                <ShieldCheck size={14} /> Protected
              </span>
            </div>

            {/* Main Score Ring & Status */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 bg-surface-sunken/40 p-6 rounded-2xl border border-border-subtle/60">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-card border-2 border-home-health/40 shadow-inner">
                <span className="text-2xl font-bold text-text-primary tracking-tight">
                  {LANDING_HOME_HEALTH.score}%
                </span>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-home-health opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-home-health" />
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-home-health">
                  {LANDING_HOME_HEALTH.status}
                </p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  {LANDING_HOME_HEALTH.summary}
                </p>
              </div>
            </div>

            {/* Quiet Guidance Cards */}
            <div className="mt-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Current Insights
              </p>
              {LANDING_HOME_HEALTH.insights.map((insight) => (
                <div
                  key={insight.title}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle/80 bg-surface-card px-4 py-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                      <Wifi size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-text-primary">
                        {insight.title}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {insight.detail}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-home-health-soft border border-home-health/20 px-2.5 py-0.5 text-[10px] font-semibold text-home-health">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
