"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";

const benefits = [
  {
    title: "Organized",
    copy: "Every device, document, and subscription in one calm, searchable home record.",
    icon: FolderKanban,
  },
  {
    title: "Secure",
    copy: "Household permissions and secure sign-in keep your vault protected.",
    icon: ShieldCheck,
  },
  {
    title: "In control",
    copy: "Track warranties, maintenance, and renewals before they catch you off guard.",
    icon: CalendarClock,
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export default function LandingBenefitsSection() {
  return (
    <MarketingContent className="py-12 md:py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <motion.article
            key={benefit.title}
            {...fadeUp}
            transition={{
              ...fadeUp.transition,
              delay: index * 0.04,
            }}
            className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-interaction-soft text-interaction">
              <benefit.icon size={18} aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-medium tracking-[-0.02em] text-text-primary">
              {benefit.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              {benefit.copy}
            </p>
          </motion.article>
        ))}
      </div>
    </MarketingContent>
  );
}
