import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Home,
  PackageSearch,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home Inventory App | Home Tech Vault",
  description:
    "Organize your home inventory, warranties, manuals, receipts, appliances, devices, and maintenance records in one secure Home Tech Vault.",
  alternates: {
    canonical: "https://hometechvault.com/home-inventory",
  },
  keywords: [
    "home inventory app",
    "home inventory tracker",
    "appliance inventory app",
    "warranty tracker app",
    "appliance warranty tracker",
    "home document organizer",
    "manual organizer",
    "home maintenance tracker",
  ],
  openGraph: {
    title: "Home Inventory Made Simple | Home Tech Vault",
    description:
      "Keep your appliances, devices, warranties, manuals, receipts, and maintenance records organized in one place.",
    url: "https://hometechvault.com/home-inventory",
    siteName: "Home Tech Vault",
    type: "website",
  },
};

const features = [
  {
    icon: PackageSearch,
    title: "Home Inventory",
    description:
      "Keep a searchable record of the appliances, electronics, and technology throughout your home.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Tracking",
    description:
      "Save warranty information and quickly see which products are still covered.",
  },
  {
    icon: FileText,
    title: "Manuals & Documents",
    description:
      "Keep manuals and important product documents connected to the devices they belong to.",
  },
  {
    icon: Receipt,
    title: "Receipts & Purchase Details",
    description:
      "Store purchase dates, prices, receipts, model numbers, and other important information.",
  },
  {
    icon: Wrench,
    title: "Maintenance Records",
    description:
      "Track maintenance information so you know what was done and when.",
  },
  {
    icon: Home,
    title: "One Home Vault",
    description:
      "Stop spreading home information across drawers, emails, notes, and folders.",
  },
];

const problems = [
  "What model is the refrigerator?",
  "Is this appliance still under warranty?",
  "Where did I save that receipt?",
  "When was this last serviced?",
  "Where is the owner's manual?",
  "What devices do we actually have in the house?",
];

export default function HomeInventoryPage() {
  return (
    <main className="min-h-screen bg-surface-base text-text-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-text-primary"
          >
            Home Tech Vault
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-charcoal-hover"
          >
            Start Your Free Vault
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-96 w-96 rounded-full bg-home-health/10 blur-3xl" />
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full border border-home-health/20 bg-home-health-soft px-4 py-2 text-sm font-medium text-home-health">
              Your home inventory, finally organized.
            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              The Home Inventory App
              <span className="block text-interaction">
                That Keeps Everything Together.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-text-secondary sm:text-xl">
              Track your appliances, devices, warranties, manuals, receipts,
              purchase details, and maintenance records in one organized
              Home Tech Vault.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-charcoal-hover hover:shadow-xl"
              >
                Start Your Free Vault
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border border-border-strong px-7 py-3.5 text-base font-semibold text-text-primary transition hover:bg-surface-base"
              >
                View Live Demo
              </Link>
            </div>

            <p className="mt-3 text-center text-sm text-text-muted">
              No credit card required.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Easy to set up
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Built for homeowners
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Access anywhere
              </span>
            </div>
          </div>
          {/* Product preview */}
          <div className="relative mx-auto mt-16 w-full max-w-[1180px]">
            <div className="absolute -inset-8 -z-10 rounded-full bg-home-health/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-border-subtle bg-surface-card p-2 shadow-[0_30px_80px_rgba(15,40,60,0.18)]">
              <Image
                src="/marketing/home-inventory-dashboard.png"
                alt="Home Tech Vault dashboard showing devices, warranties, documents, household information, and vault readiness"
                width={1278}
                height={521}
                priority
                sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 60vw, 100vw"
                className="h-auto w-full rounded-[24px]"
              />
            </div>

            <div className="absolute -bottom-14 left-8 hidden rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 shadow-lg lg:block">
              <div className="text-xs font-medium text-text-muted">
                DEVICES
              </div>
              <div className="mt-1 font-semibold text-text-primary">
                24 organized
              </div>
            </div>

            <div className="absolute right-8 -top-5 hidden rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 shadow-lg lg:block">
              <div className="text-xs font-medium text-text-muted">
                WARRANTIES
              </div>
              <div className="mt-1 font-semibold text-home-health">
                13 tracked
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border-subtle bg-surface-card">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 px-6 py-6 text-center text-sm font-medium text-text-secondary sm:flex-row sm:gap-8 lg:px-8">
          <span>Private by design</span>
          <span className="hidden text-text-muted sm:inline">•</span>
          <span>Your data stays yours</span>
          <span className="hidden text-text-muted sm:inline">•</span>
          <span>Built for homeowners</span>
        </div>
      </section>

      {/* Problem section */}
      <section className="border-y border-border-subtle bg-surface-base">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Sound familiar?
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your home's information shouldn't live everywhere.
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {problems.map((problem) => (
              <div
                key={problem}
                className="rounded-2xl border border-border-subtle bg-surface-card px-5 py-4 text-left text-text-secondary shadow-sm"
              >
                “{problem}”
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-text-secondary">
            Home Tech Vault gives all of those answers one place to live.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            One place for the useful stuff
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            Your home inventory does more than list what you own.
          </h2>

          <p className="mt-5 text-lg leading-8 text-text-secondary">
            Home Tech Vault keeps the information you'll actually need later
            connected and easy to find.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-border-subtle bg-surface-card p-7 shadow-sm"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-home-health-soft p-3 text-home-health">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold">{feature.title}</h3>

                <p className="mt-3 leading-7 text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Simple by design
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Build your home vault in minutes.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              [
                "01",
                "Add your home",
                "Start your vault and organize everything around the place you live.",
              ],
              [
                "02",
                "Add your devices",
                "Save appliances, electronics, model numbers, purchase details, and more.",
              ],
              [
                "03",
                "Keep everything connected",
                "Attach warranties, manuals, receipts, and maintenance information.",
              ],
            ].map(([number, title, description]) => (
              <div key={number}>
                <div className="text-sm font-bold text-text-muted">{number}</div>

                <h3 className="mt-3 text-xl font-bold">{title}</h3>

                <p className="mt-3 leading-7 text-text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border-subtle bg-surface-card px-6 py-16 text-center shadow-lg shadow-black/5 sm:px-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Start organizing your home today.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            Stop searching drawers, emails, folders, and old notes for
            information about the things in your home.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 font-semibold text-white transition hover:bg-charcoal-hover"
          >
            Start Your Free Vault
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Home Tech Vault</span>

          <Link href="/" className="hover:text-text-primary">
            Visit Home Tech Vault
          </Link>
        </div>
      </footer>
    </main>
  );
}
