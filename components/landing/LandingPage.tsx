"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  Laptop,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";

export default function LandingPage() {
  const router = useRouter();

  const {
    user,
    loading,
    startDemo,
  } = useDemoMode();

  function handleExploreDemo() {
    startDemo();
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading...
        </div>
      </div>
    );
  }

  const isSignedIn = Boolean(user);

  return (
    <div className="min-h-screen bg-surface-sunken text-text-primary">
      <LandingNav isSignedIn={isSignedIn} />

      <HeroSection
        isSignedIn={isSignedIn}
        onExploreDemo={handleExploreDemo}
      />

      <TrustStrip />

      <FeaturesSection />

      <DarkHealthSection />

      <LightDocumentsSection />

      <DarkFamilySection />

      <FinalCtaSection
        isSignedIn={isSignedIn}
        onExploreDemo={handleExploreDemo}
      />

      <LandingFooter />
    </div>
  );
}

function LandingNav({
  isSignedIn,
}: {
  isSignedIn: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/80 bg-surface-sunken/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-charcoal text-sm font-semibold text-surface-card">
            HT
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">
              Home Tech Vault
            </p>

            <p className="text-xs text-text-secondary">
              Organize · Protect · Simplify
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {!isSignedIn && (
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-white"
            >
              Sign In
            </Link>
          )}

          <Link
            href={
              isSignedIn
                ? "/dashboard"
                : "/signup"
            }
            className="rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-surface-card transition hover:bg-charcoal-hover sm:px-5"
          >
            {isSignedIn
              ? "Go to Your Vault"
              : "Start Free"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeroSection({
  isSignedIn,
  onExploreDemo,
}: {
  isSignedIn: boolean;
  onExploreDemo: () => void;
}) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-home-health-soft blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-home-health-soft/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-achievement">
            Home technology, finally organized
          </p>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl lg:text-[4.25rem]">
            One vault for every device in your home.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary md:text-xl">
            Track warranties, store receipts, monitor
            subscriptions, and protect your entire home
            technology inventory — without digging through
            drawers, inboxes, or old folders.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={
                isSignedIn
                  ? "/dashboard"
                  : "/signup"
              }
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-charcoal px-7 py-4 text-base font-semibold text-white transition hover:bg-charcoal-hover"
            >
              {isSignedIn
                ? "Go to Your Vault"
                : "Start Free"}
              <ArrowRight size={18} />
            </Link>

            {!isSignedIn && (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-white px-7 py-4 text-base font-semibold text-text-primary transition hover:border-border-strong hover:bg-[#FCFAF6]"
                >
                  Sign In
                </Link>

                <button
                  type="button"
                  onClick={onExploreDemo}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-warning/40 bg-warning-soft px-7 py-4 text-base font-semibold text-achievement transition hover:bg-[#FFF2D5]"
                >
                  <Sparkles size={18} />
                  Explore Demo
                </button>
              </>
            )}
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            <HeroBenefit text="Warranty and receipt tracking" />
            <HeroBenefit text="Room-by-room device inventory" />
            <HeroBenefit text="Maintenance and subscription reminders" />
            <HeroBenefit text="Household sharing with role-based access" />
          </ul>
        </div>

        <VaultDashboardMockup />
      </div>
    </section>
  );
}

function HeroBenefit({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/70 px-4 py-3 text-sm font-medium text-text-secondary">
      <CheckCircle2
        size={17}
        className="shrink-0 text-interaction"
      />
      {text}
    </li>
  );
}

function VaultDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-accent/20 via-transparent to-[#111827]/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-white shadow-[0_24px_80px_rgba(17,24,39,0.12)]">
        <div className="flex items-center justify-between border-b border-border-subtle bg-[#FCFBF8] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
              Your Vault
            </p>

            <p className="mt-1 text-lg font-semibold">
              The Demo Home
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-sunken px-3 py-2 text-xs font-semibold text-interaction">
            92% Health
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-5 text-text-primary shadow-[var(--shadow-sm)]">
            <p className="text-xs text-text-tertiary">
              Good afternoon
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Welcome back.
            </p>

            <p className="mt-3 text-sm text-text-secondary">
              8 devices · 12 documents · 5 active
              warranties
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-border-subtle bg-surface-sunken p-5">
            <HealthRing score={92} />

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Technology Health
            </p>
          </div>
        </div>

        <div className="space-y-3 px-5 pb-5">
          <MockDeviceRow
            name="MacBook Pro"
            location="Home Office"
            value="$1,999"
          />

          <MockDeviceRow
            name="Living Room Smart TV"
            location="Living Room"
            value="$1,199"
          />

          <MockDeviceRow
            name="Mesh Wi-Fi Router"
            location="Network Closet"
            value="$349"
          />
        </div>
      </div>
    </div>
  );
}

function HealthRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-[-0.04em]">
          {score}
        </span>

        <span className="text-[10px] font-semibold text-achievement">
          Excellent
        </span>
      </div>
    </div>
  );
}

function MockDeviceRow({
  name,
  location,
  value,
}: {
  name: string;
  location: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-[#FCFAF6] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Laptop size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {name}
        </p>

        <p className="truncate text-xs text-text-secondary">
          {location}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold text-achievement">
        {value}
      </p>
    </div>
  );
}

function TrustStrip() {
  const items = [
    "Device inventory",
    "Warranty alerts",
    "Document vault",
    "Network overview",
    "Family sharing",
    "Premium reports",
  ];

  return (
    <section className="border-y border-border-subtle bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 md:px-8">
        {items.map((item) => (
          <span
            key={item}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Laptop,
      title: "Complete device records",
      description:
        "Serial numbers, purchase dates, locations, and photos — organized in one searchable inventory.",
    },
    {
      icon: ShieldCheck,
      title: "Warranty protection",
      description:
        "See active, expiring, and missing coverage before a repair becomes an expensive surprise.",
    },
    {
      icon: FileText,
      title: "Document vault",
      description:
        "Store receipts, manuals, and warranty cards alongside the devices they belong to.",
    },
    {
      icon: CreditCard,
      title: "Subscription tracking",
      description:
        "Monitor streaming, cloud, and service renewals so recurring costs stay visible.",
    },
    {
      icon: Wifi,
      title: "Network center",
      description:
        "Keep router details, connected devices, and network notes in one dependable place.",
    },
    {
      icon: Wrench,
      title: "Maintenance history",
      description:
        "Schedule service tasks and preserve a clear record of what was done and when.",
    },
  ];

  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-achievement">
            Built for real households
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Everything important about your home
            technology, structured and easy to find.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <article
                key={title}
                className="rounded-[var(--radius-card)] border border-border-subtle bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-warning/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {description}
                </p>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function DarkHealthSection() {
  return (
    <section className="htv-hero-band px-5 py-20 text-text-primary md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-overline text-home-health">
            Technology health score
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Know how protected and organized your home
            really is.
          </h2>

          <p className="mt-6 text-base leading-8 text-text-secondary md:text-lg">
            Home Tech Vault calculates a living health
            score from documentation completeness,
            warranty coverage, maintenance activity, and
            inventory organization — then surfaces the
            next best action.
          </p>

          <ul className="mt-8 space-y-4">
            <DarkListItem text="Protection score from warranty and purchase data" />
            <DarkListItem text="Documentation score from receipts and manuals" />
            <DarkListItem text="Actionable recommendations on your dashboard" />
          </ul>
        </div>

        <InsightsMockup />
      </div>
    </section>
  );
}

function DarkListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-7 text-white/75 md:text-base">
      <CheckCircle2
        size={18}
        className="mt-1 shrink-0 text-interaction"
      />
      {text}
    </li>
  );
}

function InsightsMockup() {
  const bars = [
    { label: "Protection", value: 94 },
    { label: "Organization", value: 96 },
    { label: "Documentation", value: 88 },
    { label: "Maintenance", value: 90 },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Vault score
          </p>

          <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            92
            <span className="text-xl text-white/40">
              /100
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-home-health-soft px-4 py-2 text-sm font-semibold text-interaction">
          Excellent
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {bars.map(({ label, value }) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {label}
              </span>

              <span className="font-semibold text-white">
                {value}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-home-health transition-all duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-home-health/25 bg-home-health-soft p-4">
        <div className="flex items-center gap-2 text-interaction">
          <Sparkles size={16} />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            Today&apos;s insight
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-white/75">
          Upload the missing printer receipt to improve
          documentation coverage before warranty service.
        </p>
      </div>
    </div>
  );
}

function LightDocumentsSection() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <DocumentsMockup />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-achievement">
            Document vault
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Receipts and manuals stay attached to the
            devices they protect.
          </h2>

          <p className="mt-6 text-base leading-8 text-text-secondary md:text-lg">
            Upload purchase records once and find them
            instantly when something breaks, a warranty
            claim opens, or insurance asks for proof of
            ownership.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard
              value="12"
              label="Documents stored"
            />

            <StatCard
              value="$12,400"
              label="Protected asset value"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentsMockup() {
  const docs = [
    {
      name: "MacBook Pro receipt.pdf",
      type: "Receipt",
      device: "MacBook Pro",
    },
    {
      name: "Samsung TV warranty.pdf",
      type: "Warranty",
      device: "Living Room Smart TV",
    },
    {
      name: "Router setup guide.pdf",
      type: "Manual",
      device: "Mesh Wi-Fi Router",
    },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-border-subtle bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Documents
          </p>

          <p className="mt-1 text-xl font-semibold">
            Linked to devices
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <FileText size={20} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="rounded-2xl border border-border-subtle bg-[#FCFAF6] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {doc.name}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {doc.device}
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-warning-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-achievement">
                {doc.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white p-5">
      <p className="text-3xl font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-sm text-text-secondary">
        {label}
      </p>
    </div>
  );
}

function DarkFamilySection() {
  return (
    <section className="htv-hero-band px-5 py-20 text-text-primary md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <FamilyMockup />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-overline text-home-health">
            Household sharing
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Share access with the people who help run
            your home.
          </h2>

          <p className="mt-6 text-base leading-8 text-text-secondary md:text-lg">
            Invite family members with viewer, member, or
            admin roles so everyone sees the same trusted
            record — without handing over every password
            or paper file.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <RolePill label="Viewer" />
            <RolePill label="Member" />
            <RolePill label="Admin" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilyMockup() {
  const members = [
    {
      name: "Alex Morgan",
      role: "Owner",
      initials: "AM",
    },
    {
      name: "Jordan Morgan",
      role: "Member",
      initials: "JM",
    },
    {
      name: "Guest Access",
      role: "Viewer",
      initials: "GA",
    },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-section-insights shadow-[var(--shadow-sm)]">
          <Users size={20} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Family
          </p>

          <p className="text-lg font-semibold">
            The Demo Household
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-card/80 px-4 py-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-achievement">
              {member.initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {member.name}
              </p>

              <p className="text-xs text-white/45">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-home-health/25 bg-home-health-soft px-4 py-3 text-sm text-white/75">
        3 of 6 household seats in use
      </div>
    </div>
  );
}

function RolePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-text-primary">
      {label}
    </span>
  );
}

function FinalCtaSection({
  isSignedIn,
  onExploreDemo,
}: {
  isSignedIn: boolean;
  onExploreDemo: () => void;
}) {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#111827] via-[#1B2434] to-[#111827] px-7 py-14 text-center text-white shadow-xl md:px-14 md:py-20">
        <p className="text-overline text-home-health">
          Ready when you are
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
          {isSignedIn
            ? "Your vault is waiting."
            : "Start organizing your home technology today."}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
          {isSignedIn
            ? "Pick up where you left off with devices, warranties, documents, and network details already in one place."
            : "Create a free account in minutes, or explore the interactive demo with no signup required."}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={
              isSignedIn
                ? "/dashboard"
                : "/signup"
            }
            className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-charcoal px-8 py-4 text-base font-semibold text-text-primary transition hover:brightness-105 sm:w-auto"
          >
            {isSignedIn
              ? "Go to Your Vault"
              : "Start Free"}
            <ArrowRight size={18} />
          </Link>

          {!isSignedIn && (
            <button
              type="button"
              onClick={onExploreDemo}
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              <Sparkles size={18} />
              Explore Demo
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal text-xs font-semibold text-surface-card">
            HT
          </div>

          <div>
            <p className="text-sm font-semibold">
              Home Tech Vault
            </p>

            <p className="text-xs text-text-secondary">
              Organize. Protect. Simplify.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-text-secondary">
          <Link
            href="/login"
            className="transition hover:text-text-primary"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="transition hover:text-text-primary"
          >
            Start Free
          </Link>

          <Link
            href="/demo"
            className="transition hover:text-text-primary"
          >
            Demo
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-text-primary"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
