"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const familyBenefits = [
  {
    icon: UserRound,
    title: "Everyone can find what they need",
    description:
      "Your household does not have to rely on one person remembering where receipts, manuals, warranties, or device details are stored.",
  },
  {
    icon: KeyRound,
    title: "Useful information stays accessible",
    description:
      "Give household members access to the information they may actually need without passing around screenshots, notes, or old emails.",
  },
  {
    icon: Lock,
    title: "You stay in control",
    description:
      "Manage household access so your Home Tech Vault stays organized and private.",
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

export default function HomeFamilySection() {
  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-24 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-premium-soft/25 via-transparent to-home-health-soft/25 blur-3xl" />

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
            <UsersRound
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Built for the household</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            You should not be the only person
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              who knows where everything is.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Home Tech Vault can give your household one dependable place to
            find important information about the technology and appliances
            around your home.
          </motion.p>
        </motion.div>

        {/* Main household comparison */}
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
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* Pain */}
            <div className="border-b border-border-subtle p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                Without a shared vault
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">
                “Where did you put the warranty?”
              </h3>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Important household information often lives in one person's
                email, phone, filing cabinet, memory, or notes.
              </p>

              <div className="mt-6 space-y-3">
                <ProblemItem text="One person knows where the receipts are" />
                <ProblemItem text="Someone else has the appliance manual" />
                <ProblemItem text="The serial number is behind the device" />
                <ProblemItem text="Warranty details are buried in email" />
                <ProblemItem text="Nobody remembers the purchase date" />
              </div>

              <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-sunken/45 p-4">
                <p className="text-sm font-semibold text-text-primary">
                  The problem is not having the information.
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  The problem is that everyone has to know where somebody else
                  put it.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-home-health-soft/15 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                    With Home Tech Vault
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
                    One place the household can rely on.
                  </h3>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-home-health text-white sm:flex">
                  <UsersRound
                    size={22}
                    aria-hidden
                  />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Sample Household
                </p>

                <div className="mt-4 space-y-3">
                  <HouseholdMember
                    initials="J"
                    name="Jason"
                    role="Household owner"
                    access="Full access"
                  />

                  <HouseholdMember
                    initials="E"
                    name="Household Member"
                    role="Member"
                    access="Shared access"
                  />

                  <HouseholdMember
                    initials="G"
                    name="Guest"
                    role="Limited access"
                    access="Selected information"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SharedItem
                  title="Living Room TV"
                  detail="Receipt · Warranty · Manual"
                />

                <SharedItem
                  title="Kitchen Refrigerator"
                  detail="Model · Serial · Warranty"
                />

                <SharedItem
                  title="Wi-Fi Router"
                  detail="Device info · Documents"
                />

                <SharedItem
                  title="Washer & Dryer"
                  detail="Receipts · Manuals"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {familyBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[22px] border border-border-subtle bg-surface-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                  <Icon size={18} aria-hidden />
                </div>

                <h3 className="mt-4 text-base font-semibold text-text-primary">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {benefit.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Real-life examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-5xl rounded-[26px] border border-border-subtle bg-surface-sunken/40 p-6 sm:p-8"
        >
          <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
            When shared access becomes useful
          </p>

          <div className="mt-7 grid gap-6 md:grid-cols-3">
            <Situation
              title="Something breaks while you're away"
              description="Someone at home can find the device information without calling you to ask where everything is."
            />

            <Situation
              title="A repair technician arrives"
              description="The household can pull up the model number, serial number, warranty, or service information."
            />

            <Situation
              title="You replace an appliance"
              description="Everyone can see what was previously installed and keep the new device information in the same place."
            />
          </div>
        </motion.div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <div className="flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-home-health-soft text-home-health">
              <ShieldCheck
                size={20}
                aria-hidden
              />
            </div>
          </div>

          <h3 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
            Shared when you want it. Private by default.
          </h3>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Keep your household information organized in one place while
            controlling who has access to it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-sunken/45 p-3">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-warning" />

      <p className="text-sm leading-5 text-text-secondary">
        {text}
      </p>
    </div>
  );
}

function HouseholdMember({
  initials,
  name,
  role,
  access,
}: {
  initials: string;
  name: string;
  role: string;
  access: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-sunken/40 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-home-health-soft text-xs font-semibold text-home-health">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">
            {name}
          </p>

          <p className="mt-0.5 text-[10px] text-text-muted">
            {role}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-home-health/20 bg-home-health-soft px-2.5 py-1 text-[9px] font-semibold text-home-health">
        {access}
      </span>
    </div>
  );
}

function SharedItem({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-3.5">
      <div className="flex items-start gap-2.5">
        <CheckCircle2
          size={15}
          className="mt-0.5 shrink-0 text-home-health"
          aria-hidden
        />

        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-primary">
            {title}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-text-muted">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function Situation({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-home-health-soft text-home-health">
        <CheckCircle2
          size={15}
          aria-hidden
        />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}