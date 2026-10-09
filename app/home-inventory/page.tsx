import {
  MarketingText,
  MarketingImage,
} from "@/components/marketing/MarketingContent";
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
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Home Tech Vault"}
            </MarketingText>
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-charcoal-hover"
          >
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Start Your Free Vault"}
            </MarketingText>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-96 w-96 rounded-full bg-home-health/10 blur-3xl" />
        <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full border border-home-health/20 bg-home-health-soft px-4 py-2 text-sm font-medium text-home-health">
              <MarketingText scope="app/home-inventory/page.tsx">
                {"Your home inventory, finally organized."}
              </MarketingText>
            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              <MarketingText scope="app/home-inventory/page.tsx">
                {"The Home Inventory App"}
              </MarketingText>
              <span className="block text-interaction">
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"That Keeps Everything Together."}
                </MarketingText>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-text-secondary sm:text-xl">
              <MarketingText scope="app/home-inventory/page.tsx">
                {
                  "Track your appliances, devices, warranties, manuals, receipts, purchase details, and maintenance records in one organized Home Tech Vault."
                }
              </MarketingText>
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-charcoal-hover hover:shadow-xl"
              >
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"Start Your Free Vault"}
                </MarketingText>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border border-border-strong px-7 py-3.5 text-base font-semibold text-text-primary transition hover:bg-surface-base"
              >
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"View Live Demo"}
                </MarketingText>
              </Link>
            </div>

            <p className="mt-3 text-center text-sm text-text-muted">
              <MarketingText scope="app/home-inventory/page.tsx">
                {"No credit card required."}
              </MarketingText>
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"Easy to set up"}
                </MarketingText>
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"Built for homeowners"}
                </MarketingText>
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"Access anywhere"}
                </MarketingText>
              </span>
            </div>
          </div>
          {/* Product preview */}
          <div className="relative mx-auto mt-16 w-full max-w-[1180px]">
            <div className="absolute -inset-8 -z-10 rounded-full bg-home-health/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-border-subtle bg-surface-card p-2 shadow-[0_30px_80px_rgba(15,40,60,0.18)]">
              <MarketingImage
                src="/marketing/home-inventory-dashboard.png"
                alt="Home Tech Vault dashboard showing devices, warranties, documents, household information, and vault readiness"
                width={1278}
                height={521}
                priority
                sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 60vw, 100vw"
                className="h-auto w-full rounded-[24px]"
                scope="app/home-inventory/page.tsx"
              />
            </div>

            <div className="absolute -bottom-14 left-8 hidden rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 shadow-lg lg:block">
              <div className="text-xs font-medium text-text-muted">
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"DEVICES"}
                </MarketingText>
              </div>
              <div className="mt-1 font-semibold text-text-primary">
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"24 organized"}
                </MarketingText>
              </div>
            </div>

            <div className="absolute right-8 -top-5 hidden rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 shadow-lg lg:block">
              <div className="text-xs font-medium text-text-muted">
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"WARRANTIES"}
                </MarketingText>
              </div>
              <div className="mt-1 font-semibold text-home-health">
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"13 tracked"}
                </MarketingText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border-subtle bg-surface-card">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 px-6 py-6 text-center text-sm font-medium text-text-secondary sm:flex-row sm:gap-8 lg:px-8">
          <span>
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Private by design"}
            </MarketingText>
          </span>
          <span className="hidden text-text-muted sm:inline">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"\u2022"}
            </MarketingText>
          </span>
          <span>
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Your data stays yours"}
            </MarketingText>
          </span>
          <span className="hidden text-text-muted sm:inline">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"\u2022"}
            </MarketingText>
          </span>
          <span>
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Built for homeowners"}
            </MarketingText>
          </span>
        </div>
      </section>

      {/* Problem section */}
      <section className="border-y border-border-subtle bg-surface-base">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Sound familiar?"}
            </MarketingText>
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Your home's information shouldn't live everywhere."}
            </MarketingText>
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {problems.map((problem) => (
              <div
                key={problem}
                className="rounded-2xl border border-border-subtle bg-surface-card px-5 py-4 text-left text-text-secondary shadow-sm"
              >
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"\u201C"}
                </MarketingText>
                <MarketingText scope="shared">{problem}</MarketingText>
                <MarketingText scope="app/home-inventory/page.tsx">
                  {"\u201D"}
                </MarketingText>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-text-secondary">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Home Tech Vault gives all of those answers one place to live."}
            </MarketingText>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"One place for the useful stuff"}
            </MarketingText>
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Your home inventory does more than list what you own."}
            </MarketingText>
          </h2>

          <p className="mt-5 text-lg leading-8 text-text-secondary">
            <MarketingText scope="app/home-inventory/page.tsx">
              {
                "Home Tech Vault keeps the information you'll actually need later connected and easy to find."
              }
            </MarketingText>
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

                <h3 className="text-xl font-bold">
                  <MarketingText scope="shared">{feature.title}</MarketingText>
                </h3>

                <p className="mt-3 leading-7 text-text-secondary">
                  <MarketingText scope="shared">
                    {feature.description}
                  </MarketingText>
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
              <MarketingText scope="app/home-inventory/page.tsx">
                {"Simple by design"}
              </MarketingText>
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              <MarketingText scope="app/home-inventory/page.tsx">
                {"Build your home vault in minutes."}
              </MarketingText>
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
                <div className="text-sm font-bold text-text-muted">
                  <MarketingText scope="shared">{number}</MarketingText>
                </div>

                <h3 className="mt-3 text-xl font-bold">
                  <MarketingText scope="shared">{title}</MarketingText>
                </h3>

                <p className="mt-3 leading-7 text-text-muted">
                  <MarketingText scope="shared">{description}</MarketingText>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border-subtle bg-surface-card px-6 py-16 text-center shadow-lg shadow-black/5 sm:px-12">
          <h2 className="text-4xl font-bold tracking-tight">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Start organizing your home today."}
            </MarketingText>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            <MarketingText scope="app/home-inventory/page.tsx">
              {
                "Stop searching drawers, emails, folders, and old notes for information about the things in your home."
              }
            </MarketingText>
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 font-semibold text-white transition hover:bg-charcoal-hover"
          >
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Start Your Free Vault"}
            </MarketingText>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            <MarketingText scope="app/home-inventory/page.tsx">
              {"\u00A9 2026 Home Tech Vault"}
            </MarketingText>
          </span>

          <Link href="/" className="hover:text-text-primary">
            <MarketingText scope="app/home-inventory/page.tsx">
              {"Visit Home Tech Vault"}
            </MarketingText>
          </Link>
        </div>
      </footer>
    </main>
  );
}
