import Link from "next/link";

import {
  Check,
  FileText,
  Forward,
  HardDrive,
  Home,
  Mail,
  Network,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export function SmartImportProblemSection() {
  const questions = [
    {
      title: "Warranty claim",
      question: "When did I buy this?",
    },
    {
      title: "Insurance claim",
      question: "What model was it?",
    },
    {
      title: "Selling a device",
      question: "Where's the receipt?",
    },
    {
      title: "Something breaks",
      question: "Is this still covered?",
    },
  ];

  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
              The real problem
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
              The receipt exists.
              <br />
              You just can&apos;t find it
              when you need it.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
              Purchase information gets
              scattered across inboxes,
              downloads, store accounts,
              photos, PDFs and paper
              receipts. Home Tech Vault
              keeps the important details
              connected to the thing you
              actually own.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {questions.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-border-subtle bg-surface-card p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  {item.title}
                </p>

                <p className="mt-3 text-lg font-semibold text-text-primary">
                  “{item.question}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SmartImportBenefitsSection() {
  const benefits = [
    {
      icon: Forward,
      title: "Forward instead of type",
      text: "Skip repetitive purchase entry and use the confirmation you already received.",
    },
    {
      icon: Check,
      title: "Review before saving",
      text: "Smart Import prepares the record. You stay in control of what enters your Vault.",
    },
    {
      icon: Receipt,
      title: "Keep purchase details together",
      text: "Keep dates, prices, model details, receipts, documents and warranty information organized.",
    },
    {
      icon: Sparkles,
      title: "Grow your Vault over time",
      text: "Forward future purchases and your home technology record becomes more complete.",
    },
  ];

  return (
    <section className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            Less busywork
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            Your Vault grows without
            the homework.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon =
              benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-[24px] border border-border-subtle bg-surface-base p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                  <Icon
                    size={19}
                    aria-hidden
                  />
                </div>

                <h3 className="mt-5 font-semibold text-text-primary">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {benefit.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BeforeAfterSection() {
  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            One useful record
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            From scattered information
            to something you can actually use.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          {/* BEFORE */}

          <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Before
            </p>

            <h3 className="mt-3 text-xl font-semibold text-text-primary">
              Information everywhere
            </h3>

            <div className="mt-6 space-y-3">
              <ChaosRow
                icon={Mail}
                text="Inbox"
              />
              <ChaosRow
                icon={HardDrive}
                text="Downloads folder"
              />
              <ChaosRow
                icon={FileText}
                text="Random PDFs"
              />
              <ChaosRow
                icon={Receipt}
                text="Paper receipts"
              />
              <ChaosRow
                icon={Search}
                text="Store order history"
              />
            </div>
          </div>

          {/* AFTER */}

          <div className="rounded-[28px] border border-home-health/20 bg-home-health-soft/25 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
                After
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-home-health text-white">
                <Check
                  size={16}
                  aria-hidden
                />
              </div>
            </div>

            <h3 className="mt-3 text-xl font-semibold text-text-primary">
              LG UltraWide Monitor
            </h3>

            <div className="mt-6 space-y-3">
              <VaultRow
                label="Purchased"
                value="Aug 12, 2026"
              />

              <VaultRow
                label="Price"
                value="$349.99"
              />

              <VaultRow
                label="Receipt"
                value="Saved"
              />

              <VaultRow
                label="Warranty"
                value="Tracked"
              />

              <VaultRow
                label="Documents"
                value="2 files"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StartWithOneReceiptSection({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const href = isSignedIn
    ? "/imports"
    : MARKETING_ROUTES.signup;

  const steps = [
    "Create your free Vault",
    "Copy your Smart Import address",
    "Forward one old purchase email",
    "Review what we found",
  ];

  return (
    <section className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
          Start small
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
          You don&apos;t have to inventory
          your whole house today.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          Start with one receipt. That&apos;s
          enough to see how Home Tech Vault
          can make organizing your technology
          easier.
        </p>

        <div className="mt-12 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(
            (step, index) => (
              <div
                key={step}
                className="rounded-[22px] border border-border-subtle bg-surface-base p-5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-home-health text-xs font-bold text-white">
                  {index + 1}
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-text-primary">
                  {step}
                </p>
              </div>
            )
          )}
        </div>

        <Link
          href={href}
          className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-home-health px-7 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {isSignedIn
            ? "Open Smart Import"
            : "Try Smart Import Free"}
        </Link>
      </div>
    </section>
  );
}

export function VaultFeaturesSection() {
  const features = [
    {
      icon: Home,
      title: "Devices",
      text: "Know what you own and where it lives.",
    },
    {
      icon: FileText,
      title: "Documents",
      text: "Keep receipts, manuals and important files attached.",
    },
    {
      icon: ShieldCheck,
      title: "Warranties",
      text: "Keep coverage details where you can actually find them.",
    },
    {
      icon: Wrench,
      title: "Maintenance",
      text: "Remember service, upkeep and important dates.",
    },
    {
      icon: Network,
      title: "Home Wi-Fi",
      text: "Keep useful context about the technology in your home.",
    },
    {
      icon: Users,
      title: "Family",
      text: "Make household information accessible to the right people.",
    },
  ];

  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
            <Sparkles
              size={14}
              aria-hidden
            />

            More than importing
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            Smart Import gets it in.
            <br />
            Home Tech Vault keeps it useful.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            Once a device is in your Vault,
            its purchase history, documents,
            warranty information and other
            useful details can stay together.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(
            (feature) => {
              const Icon =
                feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-[24px] border border-border-subtle bg-surface-card p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                    <Icon
                      size={19}
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-text-primary">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {feature.text}
                  </p>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

function ChaosRow({
  icon: Icon,
  text,
}: {
  icon: typeof Mail;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-sunken/60 px-4 py-3">
      <Icon
        size={16}
        className="text-text-muted"
        aria-hidden
      />

      <span className="text-sm font-medium text-text-secondary">
        {text}
      </span>
    </div>
  );
}

function VaultRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-card px-4 py-3">
      <span className="text-xs text-text-muted">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
        <Check
          size={13}
          className="text-home-health"
          aria-hidden
        />

        {value}
      </span>
    </div>
  );
}