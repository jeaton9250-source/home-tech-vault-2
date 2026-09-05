"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Home,
  PackageCheck,
  Receipt,
  Router,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";

const moments = [
  {
    title: "When something breaks",
    description:
      "Find the model, manual, receipt and warranty fast.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "When something needs service",
    description:
      "See what was done before and when it was last handled.",
    image:
      "https://images.unsplash.com/photo-1631545806609-93f5f82e0d8c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "When you need proof",
    description:
      "Keep documents, serial numbers and receipts together.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "When you sell your home",
    description:
      "Pass along the story and records that belong with it.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
  },
];

const timeline = [
  {
    year: "2026",
    title: "Home purchased",
    icon: Home,
  },
  {
    year: "2027",
    title: "Refrigerator installed",
    icon: PackageCheck,
  },
  {
    year: "2028",
    title: "HVAC serviced",
    icon: Wrench,
  },
  {
    year: "2029",
    title: "Washer replaced",
    icon: Receipt,
  },
  {
    year: "2030",
    title: "Roof documentation added",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-[#fbfaf7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-serif text-3xl font-semibold tracking-[-0.04em]">
              HTV
            </span>

            <span className="hidden text-sm font-medium text-[#263649] sm:block">
              Home Tech Vault
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[#435164] lg:flex">
            <Link
              href="/what-it-remembers"
              className="transition hover:text-[#152335]"
            >
              What It Remembers
            </Link>

            <Link
              href="/explore"
              className="transition hover:text-[#152335]"
            >
              Explore
            </Link>

            <Link
              href="/realtors"
              className="transition hover:text-[#152335]"
            >
              For Realtors
            </Link>

            <Link
              href="/pricing"
              className="transition hover:text-[#152335]"
            >
              Pricing
            </Link>

            <Link
              href="/our-story"
              className="transition hover:text-[#152335]"
            >
              Our Story
            </Link>

            <Link
              href="/login"
              className="transition hover:text-[#152335]"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#152335] px-6 py-3 font-medium text-white transition hover:bg-[#24374c]"
            >
              Start Your Home
            </Link>
          </nav>

          <Link
            href="/signup"
            className="rounded-full bg-[#152335] px-5 py-2.5 text-sm font-medium text-white lg:hidden"
          >
            Start
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90"
            alt="Modern home interior"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ec]/95 via-[#f7f3ec]/80 to-[#f7f3ec]/10" />
        </div>

        <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] items-center px-5 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div className="max-w-[660px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152335]/10 bg-white/65 px-4 py-2 text-sm backdrop-blur-md">
              <Home className="h-4 w-4" />
              Built for the place you call home
            </div>

            <h1 className="font-serif text-[56px] leading-[0.95] tracking-[-0.05em] sm:text-[76px] lg:text-[92px]">
              Your home
              <br />
              has a memory.
            </h1>

            <p className="mt-7 max-w-[600px] text-lg leading-8 text-[#37475a] sm:text-xl">
              Manuals get lost. Receipts disappear.
              Warranties expire. Service dates get
              forgotten. Home Tech Vault keeps the useful
              history of your home together for the years
              ahead.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#24374c]"
              >
                Start Your Home
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-3 py-4 text-sm font-semibold text-[#152335]"
              >
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#657184]">
              Free to start. No credit card required.
            </p>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="max-w-[240px] border-l border-[#152335]/20 pl-6">
              <p className="font-serif text-xl italic leading-8 text-[#39475a]">
                A more organized tomorrow for the place you
                call home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAPERWORK */}
      <section
        id="how-it-works"
        className="px-5 py-20 sm:px-6 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[34px] bg-[#ebe5db]">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[400px] lg:min-h-[560px]">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=90"
                alt="Paperwork and important documents"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute bottom-6 left-6 rounded-2xl bg-[#fffdf9]/95 p-5 shadow-xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8795]">
                  Still looking?
                </p>

                <p className="mt-2 font-serif text-xl">
                  HVAC warranty...
                </p>

                <p className="mt-1 text-sm text-[#6b7683]">
                  Somewhere in the house.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-20">
              <span className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#7d705e]">
                The home binder, reimagined
              </span>

              <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Every home comes
                <br />
                with paperwork.
              </h2>

              <p className="mt-6 max-w-[500px] text-lg leading-8 text-[#596271]">
                Manuals in drawers. Receipts in email.
                Warranty cards in boxes. Maintenance dates
                somewhere in your head.
              </p>

              <p className="mt-6 font-serif text-2xl italic">
                There should be one place for all of it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Manuals",
                  "Receipts",
                  "Warranties",
                  "Maintenance",
                  "Documents",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#36475a]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL LIFE MOMENTS */}
      <section className="px-5 pb-24 sm:px-6 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#728095]">
                Made for real life
              </span>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Real life happens at home.
              </h2>
            </div>

            <p className="max-w-[440px] text-lg leading-8 text-[#687486]">
              Home Tech Vault is there for the moments when
              knowing your home matters most.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {moments.map((moment) => (
              <article
                key={moment.title}
                className="group overflow-hidden rounded-[26px] bg-[#fffdf9] shadow-[0_12px_40px_rgba(20,35,52,0.06)]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                </div>

                <div className="p-7">
                  <h3 className="font-serif text-2xl leading-tight">
                    {moment.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#667181]">
                    {moment.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOME RECORD TIMELINE */}
      <section className="border-y border-[#152335]/[0.07] bg-[#efede8] px-5 py-24 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#728095]">
                More than storage
              </span>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                The record of your home.
              </h2>
            </div>

            <p className="max-w-[430px] text-lg leading-8 text-[#687486]">
              A clearer history for everything your home
              has been through.
            </p>
          </div>

          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-3 hidden h-px bg-[#152335]/25 md:block" />

            <div className="grid gap-5 md:grid-cols-5">
              {timeline.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.year} className="relative">
                    <div className="relative z-10 mb-5 hidden h-6 items-center md:flex">
                      <div className="h-3 w-3 rounded-full bg-[#152335]" />
                    </div>

                    <div className="rounded-[22px] border border-[#152335]/[0.08] bg-[#fbfaf7] p-6">
                      <Icon className="h-6 w-6 text-[#364a61]" />

                      <div className="mt-8 font-semibold">
                        {item.year}
                      </div>

                      <div className="mt-1 min-h-[48px] text-sm leading-6 text-[#637082]">
                        {item.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* APPLIANCE STORY */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] items-center gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#728095]">
              Everything stays connected
            </span>

            <h2 className="mt-4 max-w-[500px] font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              Everything about it stays with it.
            </h2>

            <p className="mt-7 max-w-[470px] text-lg leading-8 text-[#657184]">
              Keep the details that matter right beside the
              things you actually own.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[32px] bg-[#ece8e0] md:grid-cols-2">
            <div className="min-h-[430px] md:min-h-[520px]">
              <img
                src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=90"
                alt="Refrigerator in modern kitchen"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center p-7 sm:p-10 lg:p-12">
              <div className="w-full rounded-[24px] bg-white p-7 shadow-[0_16px_50px_rgba(22,35,51,0.09)] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8993a2]">
                      Appliance record
                    </p>

                    <h3 className="mt-2 font-serif text-3xl">
                      LG Refrigerator
                    </h3>
                  </div>

                  <div className="rounded-full bg-[#f3f5f7] p-3">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {[
                    "Purchased June 2026",
                    "Warranty through June 2028",
                    "Manual saved",
                    "Water filter replaced July 2026",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f5]">
                        <Check className="h-4 w-4" />
                      </div>

                      <span className="text-sm leading-6 text-[#415165]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASK YOUR HOME */}
      <section className="bg-[#e7edf1] px-5 py-24 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#152335] text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <h2 className="font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
              Just ask
              <br />
              your home.
            </h2>

            <p className="mt-6 max-w-[460px] text-lg leading-8 text-[#667486]">
              Stop searching through drawers, inboxes and
              old notes. Ask HTV and get the answer from
              the records you already saved.
            </p>
          </div>

          <div className="space-y-5">
            <div className="ml-auto max-w-[560px] rounded-[28px] rounded-br-[10px] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7edf2]">
                  <Search className="h-4 w-4" />
                </div>

                <p className="font-medium">
                  Is my refrigerator still under warranty?
                </p>
              </div>
            </div>

            <div className="max-w-[610px] rounded-[28px] rounded-bl-[10px] bg-[#152335] p-6 text-white shadow-sm sm:p-7">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                  HTV
                </div>

                <div>
                  <p className="leading-7 text-white/90">
                    Yes. Your LG refrigerator is covered
                    through June 2028.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
                    <span>Receipt saved</span>
                    <span>•</span>
                    <span>Warranty document saved</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-auto max-w-[520px] rounded-[28px] rounded-br-[10px] bg-white p-6 shadow-sm sm:p-7">
              <p className="font-medium">
                When did we last service the HVAC?
              </p>
            </div>

            <div className="max-w-[580px] rounded-[28px] rounded-bl-[10px] bg-[#152335] p-6 text-white shadow-sm sm:p-7">
              <p className="leading-7 text-white/90">
                March 14, 2028. Wilson Heating &amp; Air
                completed the service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOVERY */}
      <section className="border-b border-[#152335]/[0.08] bg-[#fbfaf7] px-5 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef1f2]">
              <Router className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-serif text-3xl leading-tight">
                Your home can even help fill itself in.
              </h3>

              <p className="mt-2 max-w-[670px] leading-7 text-[#687486]">
                HTV can discover supported devices already
                in your home so you don&apos;t have to
                start from scratch.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center gap-2 font-semibold"
          >
            Start Your Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* REALTOR / BUILDER CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90"
            alt="Beautiful house exterior"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#152335]/90 via-[#152335]/72 to-[#152335]/25" />
        </div>

        <div className="relative mx-auto flex min-h-[500px] max-w-[1380px] items-center px-5 py-24 sm:px-6 lg:px-10">
          <div className="max-w-[680px] text-white">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
              A better move-in
            </span>

            <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Moving into
              <br />
              a new home?
            </h2>

            <p className="mt-6 max-w-[570px] text-lg leading-8 text-white/75">
              Your home&apos;s record can start before you
              even get the keys.
            </p>

            <Link
              href="/realtors"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#152335] transition hover:bg-white/90"
            >
              For Realtors &amp; Builders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#152335] px-5 py-24 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <Home className="h-8 w-8 text-white/60" />

          <h2 className="mt-6 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Give your home
            <br />
            a place to remember.
          </h2>

          <p className="mt-7 max-w-[600px] text-lg leading-8 text-white/65">
            Manuals, warranties, receipts, maintenance and
            the history of your home — together at last.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#152335] transition hover:bg-[#f1f3f5]"
          >
            Start Your Home
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-sm text-white/45">
            Free to start.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f7f5f1] px-5 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid gap-10 border-b border-[#152335]/10 pb-12 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl font-semibold tracking-[-0.04em]">
                  HTV
                </span>

                <span className="text-sm font-medium">
                  Home Tech Vault
                </span>
              </div>

              <p className="mt-5 max-w-[400px] leading-7 text-[#6a7585]">
                Your home remembers more than you think.
                Keep its useful history in one place.
              </p>
            </div>

            <div>
              <p className="font-semibold">Explore</p>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#6a7585]">
                <Link
                  href="/what-it-remembers"
                  className="hover:text-[#152335]"
                >
                  What It Remembers
                </Link>

                <Link
                  href="/explore"
                  className="hover:text-[#152335]"
                >
                  Explore
                </Link>

                <Link
                  href="/pricing"
                  className="hover:text-[#152335]"
                >
                  Pricing
                </Link>

                <Link
                  href="/realtors"
                  className="hover:text-[#152335]"
                >
                  For Realtors
                </Link>
              </div>
            </div>

            <div>
              <p className="font-semibold">Company</p>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#6a7585]">
                <Link
                  href="/our-story"
                  className="hover:text-[#152335]"
                >
                  Our Story
                </Link>

                <Link
                  href="/login"
                  className="hover:text-[#152335]"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="hover:text-[#152335]"
                >
                  Create Your Home
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 pt-8 text-xs text-[#7c8592] sm:flex-row">
            <p>
              © {new Date().getFullYear()} Home Tech Vault.
              All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link
                href="/privacy"
                className="hover:text-[#152335]"
              >
                Privacy
              </Link>

              <Link
                href="/terms"
                className="hover:text-[#152335]"
              >
                Terms
              </Link>

              <Link
                href="/contact"
                className="hover:text-[#152335]"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
