"use client";

import { motion } from "framer-motion";
import { Radar, Wifi } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_DISCOVERY,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeDiscoverySection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.discovery}
      className={cn(
        "bg-surface-sunken/40 px-5 py-20 md:px-8 md:py-28 lg:px-12 border-y border-border-subtle/50",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="htv-glass-card-elevated order-2 p-6 sm:p-8 md:order-1 rounded-[32px] border border-border-subtle bg-surface-card shadow-lift"
          >
            <div className="mb-6 flex items-center justify-between border-b border-border-subtle/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-home-health-soft text-home-health shadow-sm">
                  <Radar size={18} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Discovery Pulse Active
                  </p>
                  <p className="text-xs text-text-muted">
                    Connected technology discovered across room nodes
                  </p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 rounded-full bg-home-health animate-pulse" />
            </div>

            <ul className="divide-y divide-border-subtle/60 overflow-hidden rounded-2xl border border-border-subtle/80 bg-surface-card shadow-sm">
              {LANDING_DISCOVERY.devices.map((device) => (
                <li
                  key={device.name}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface-sunken/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-interaction-soft text-interaction shrink-0">
                      <Wifi size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-text-primary">
                        {device.name}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {device.room}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-home-health-soft border border-home-health/20 px-2.5 py-0.5 text-[10px] font-semibold text-home-health">
                    {device.state}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="order-1 md:order-2"
          >
            <p className={landingTheme.eyebrow}>
              {LANDING_DISCOVERY.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_DISCOVERY.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl text-text-muted")}>
              {LANDING_DISCOVERY.text}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
