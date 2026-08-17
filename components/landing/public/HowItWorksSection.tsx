"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  PlusCircle,
  Search,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add one thing",
    description:
      "Start with something you already own — your TV, refrigerator, washer, laptop, router, or anything else you want to keep track of.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Save what matters",
    description:
      "Add the receipt, warranty, model number, serial number, manual, and purchase details whenever you have them.",
  },
  {
    number: "03",
    icon: Search,
    title: "Find it later",
    description:
      "When something breaks, needs service, gets sold, or gets replaced, the important information is already there.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: custom * 0.07,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-surface-sunken/30 px-5 py-16 md:px-8 md:py-20 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
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
            <CheckCircle2
              size={14}
              className="text-home-health"
              aria-hidden
            />

            <span>Start small</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            You don&apos;t have to organize
            <span className="block">
              your whole house today.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Start with one thing. Add more naturally as you buy, replace, or
            organize the things around your home.
          </motion.p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                    <Icon
                      size={20}
                      aria-hidden
                    />
                  </div>

                  <span className="text-xs font-semibold tracking-[0.14em] text-text-muted">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-text-primary">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto mt-10 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            That&apos;s it.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            One device today is better than waiting until you have time to
            organize everything.
          </p>
        </motion.div>
      </div>
    </section>
  );
}