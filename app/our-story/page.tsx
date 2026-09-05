import Link from "next/link";
import {
  ArrowRight,
  Home,
  Heart,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#152335]/[0.06] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(232,241,244,0.78)_45%,rgba(247,245,241,1)_82%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-[420px] w-[420px] rounded-full bg-white/70 blur-[110px]" />
          <div className="absolute right-[-100px] top-20 h-[500px] w-[500px] rounded-full bg-[#dce8eb]/60 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-[1380px] items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="max-w-[680px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152335]/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f7e8d] backdrop-blur">
              <Heart className="h-4 w-4" />
              Our Story
            </div>

            <h1 className="font-serif text-[52px] leading-[0.98] tracking-[-0.05em] sm:text-[68px] lg:text-[78px]">
              I built HTV because
              <br />
              homes deserve a memory.
            </h1>

            <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#637184] sm:text-xl">
              Home Tech Vault started with a simple frustration:
              important information about a home was everywhere,
              except where you actually needed it.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#24384c]"
              >
                Start Your Home
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/12 bg-white/60 px-7 py-4 text-sm font-semibold text-[#152335] backdrop-blur transition hover:bg-white"
              >
                Explore HTV
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[36px] shadow-[0_30px_90px_rgba(29,47,66,0.14)]">
            <img
              src="https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1400&q=90"
              alt="A welcoming home"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* PERSONAL FOUNDER STORY */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              Where it started
            </p>
          </div>

          <div>
            <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.04em] sm:text-5xl">
              I kept seeing the same problem:
              homeowners had the information,
              but no real place to keep it.
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-[#687486]">
              <p>
                Manuals ended up in drawers. Receipts lived in
                email. Warranty information got lost. Service
                dates were written down somewhere — or not at all.
              </p>

              <p>
                The information existed, but it was scattered.
                And when something broke, when a warranty was
                needed, or when it was time to sell, finding the
                right detail became harder than it should have been.
              </p>

              <p>
                I started thinking about how much history a home
                quietly builds over time. Appliances get replaced.
                Systems get serviced. Rooms get updated. Documents
                get signed. Every year adds another layer.
              </p>

              <p className="font-serif text-2xl italic text-[#2e4053]">
                What if the home itself had one place to remember it all?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="bg-[#ebe9e3] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              Why it matters
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              HTV is meant to make
              homeownership feel a little easier.
            </h2>

            <p className="mx-auto mt-6 max-w-[660px] text-lg leading-8 text-[#687486]">
              Not by adding another complicated app to your life,
              but by giving your home a place for the details
              you&apos;ll eventually need.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: "Less searching",
                copy: "Know where to look when you need a manual, receipt, warranty or service record.",
              },
              {
                icon: ShieldCheck,
                title: "More confidence",
                copy: "Keep a clearer record of what your home owns, what was done, and when.",
              },
              {
                icon: Home,
                title: "A history that stays",
                copy: "Build a useful home record that can grow with the property over time.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[28px] bg-white/65 p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7ecee]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-8 font-serif text-3xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-[#687486]">
                    {item.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              Where it&apos;s going
            </p>
          </div>

          <div>
            <h2 className="font-serif text-4xl leading-[1.08] tracking-[-0.04em] sm:text-5xl">
              The long-term idea is bigger than storing documents.
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-[#687486]">
              <p>
                I want Home Tech Vault to become the living record
                of a home — something that becomes more useful the
                longer you own the property.
              </p>

              <p>
                When something breaks, you should know what it is.
                When something gets serviced, the history should be
                there. When you replace an appliance, that change
                should become part of the home&apos;s record.
              </p>

              <p>
                And someday, when that home changes hands, the useful
                history shouldn&apos;t have to disappear with the
                previous owner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="px-5 pb-24 sm:px-6 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-[1000px] rounded-[36px] bg-[#152335] px-8 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            A note from the founder
          </p>

          <p className="mt-7 font-serif text-3xl leading-[1.3] tracking-[-0.02em] sm:text-4xl">
            “HTV is still growing, but the goal has stayed simple:
            make the information that comes with owning a home
            easier to keep, easier to find, and more useful over time.”
          </p>

          <div className="mt-9 border-t border-white/10 pt-7">
            <p className="font-semibold">
              Jason
            </p>

            <p className="mt-1 text-sm text-white/50">
              Founder, Home Tech Vault
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#ece9e2] px-5 py-24 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <Home className="h-8 w-8 text-[#152335]/45" />

          <h2 className="mt-6 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
            Start building your home&apos;s story.
          </h2>

          <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#687486]">
            One appliance, one receipt, one repair at a time.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#152335] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#24384c]"
          >
            Start Your Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
