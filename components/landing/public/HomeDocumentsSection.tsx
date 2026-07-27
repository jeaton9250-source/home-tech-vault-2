"use client";

import { motion } from "framer-motion";
import { Check, FileText, ShieldCheck } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_DOCUMENTS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeDocumentsSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.documents}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
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
              {LANDING_DOCUMENTS.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_DOCUMENTS.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl text-text-muted")}>
              {LANDING_DOCUMENTS.text}
            </p>

            <ul className="mt-8 space-y-3.5">
              {LANDING_DOCUMENTS.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-text-primary font-medium"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-home-health-soft text-home-health mt-0.5">
                    <Check size={13} strokeWidth={2.5} aria-hidden />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="htv-glass-card-elevated space-y-4 p-6 sm:p-8 rounded-[32px] border border-border-subtle bg-surface-card shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-border-subtle/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-home-health-soft text-home-health shadow-sm">
                  <FileText size={18} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    LG OLED 4K Smart TV
                  </p>
                  <p className="text-xs text-text-muted">
                    Unified Protection Record
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-home-health-soft px-2.5 py-0.5 text-[10px] font-semibold text-home-health border border-home-health/20">
                <ShieldCheck size={12} /> Auto-Linked
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle/80 bg-surface-sunken/40 px-4 py-3 text-xs font-semibold text-text-primary">
                <span>Receipt</span>
                <span className="text-text-muted font-medium">Jan 2025 · Verified</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle/80 bg-surface-sunken/40 px-4 py-3 text-xs font-semibold text-text-primary">
                <span>Manufacturer Warranty</span>
                <span className="text-home-health font-semibold">Active · 2 Years Remaining</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle/80 bg-surface-sunken/40 px-4 py-3 text-xs font-semibold text-text-primary">
                <span>Maintenance Schedule</span>
                <span className="text-text-muted font-medium">Panel Pixel Refresh · Semi-Annual</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle/80 bg-surface-sunken/40 px-4 py-3 text-xs font-semibold text-text-primary">
                <span>Setup &amp; User Guide</span>
                <span className="text-interaction font-medium">PDF Manual Attached</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
