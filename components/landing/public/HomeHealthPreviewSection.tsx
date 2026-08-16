"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const insights = [
  {
    icon: ShieldCheck,
    title: "Warranty expiring soon",
    detail: "Living Room TV · 32 days remaining",
    status: "Review",
    tone: "attention" as const,
  },
  {
    icon: CheckCircle2,
    title: "Warranty information saved",
    detail: "Kitchen Refrigerator · Coverage active",
    status: "Protected",
    tone: "good" as const,
  },
  {
    icon: Clock3,
    title: "Maintenance coming up",
    detail: "HVAC Filter · Due in 12 days",
    status: "Upcoming",
    tone: "attention" as const,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HomeHealthPreviewSection() {
  return (
    <section className="relative overflow-hidden bg-surface-sunken/35 px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-home-health-soft/30 via-transparent to-premium-soft/30 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        {/* Intro */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className={`${landingTheme.pill} mx-auto`}
          >
            <HeartPulse
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>And once your vault grows...</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            See what needs attention
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              before you forget about it.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Organizing your devices is only the beginning. Home Tech Vault can
            help surface important warranty and maintenance information so you
            know what may need your attention next.
          </motion.p>
        </motion.div>

        {/* Main health preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lift"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Home Tech Vault
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                Home Health
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1.5 text-[11px] font-semibold text-home-health">
              <HeartPulse
                size={13}
                aria-hidden
              />
              Sample overview
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            {/* Score */}
            <div className="border-b border-border-subtle p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Vault readiness
              </p>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-home-health-soft bg-surface-base shadow-inner">
                  <div>
                    <p className="text-4xl font-semibold tracking-[-0.05em] text-text-primary">
                      82%
                    </p>

                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-home-health">
                      Organized
                    </p>
                  </div>

                  <span className="absolute right-2 top-4 flex h-4 w-4 rounded-full bg-home-health" />
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-tight text-text-primary">
                  Your vault is taking shape.
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  Most of your important devices have useful information saved,
                  with a few things still worth adding or reviewing.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <MetricCard
                  value="8"
                  label="Devices"
                />

                <MetricCard
                  value="14"
                  label="Documents"
                />

                <MetricCard
                  value="6"
                  label="Warranties"
                />
              </div>
            </div>

            {/* Insights */}
            <div className="p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  What may need attention
                </p>

                <p className="mt-1 text-sm font-semibold text-text-primary">
                  Useful information, surfaced from your vault
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {insights.map((insight) => {
                  const Icon = insight.icon;

                  return (
                    <div
                      key={insight.title}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            insight.tone === "attention"
                              ? "bg-warning-soft text-warning"
                              : "bg-home-health-soft text-home-health"
                          }`}
                        >
                          <Icon
                            size={18}
                            aria-hidden
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {insight.title}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-text-muted">
                            {insight.detail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          insight.tone === "attention"
                            ? "border border-warning/20 bg-warning-soft text-warning"
                            : "border border-home-health/20 bg-home-health-soft text-home-health"
                        }`}
                      >
                        {insight.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-sunken/40 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-warning"
                    aria-hidden
                  />

                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Missing information becomes easier to spot.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      If a device does not have a receipt, warranty, serial
                      number, or other useful detail saved yet, your vault can
                      help make those gaps easier to see.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefit cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <BenefitCard
            icon={ShieldCheck}
            title="Keep coverage visible"
            description="See warranty information alongside the device instead of remembering dates yourself."
          />

          <BenefitCard
            icon={Clock3}
            title="Remember what is coming up"
            description="Keep important maintenance dates and future tasks from disappearing into your calendar or notes."
          />

          <BenefitCard
            icon={Wrench}
            title="Know what needs work"
            description="See where information is missing or where a device may need attention."
          />
        </div>

        {/* Positioning */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-3xl rounded-[24px] border border-border-subtle bg-surface-card p-6 text-center sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
            Organization first. Insights second.
          </p>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Your vault becomes more useful as you build it.
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Start with the information you already care about. As you add more
            devices, documents, warranties, and maintenance details, Home Tech
            Vault can give you a clearer picture of the technology around your
            home.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-sunken/50 p-3 text-center">
      <p className="text-lg font-semibold tracking-tight text-text-primary">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-medium text-text-muted">
        {label}
      </p>
    </div>
  );
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  title: string;
  description: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-[22px] border border-border-subtle bg-surface-card p-6"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
        <Icon
          size={18}
          aria-hidden
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </motion.article>
  );
}