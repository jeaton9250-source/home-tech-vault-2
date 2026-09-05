import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Home,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

const storyBlocks = [
  {
    eyebrow: "The things you bought",
    title: "Appliances, fixtures, equipment and the details that came with them.",
    body:
      "Model numbers, purchase dates, manuals and receipts are useful right up until the moment you cannot find them. HTV keeps those details tied to the things they belong to.",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1400&q=90",
  },
  {
    eyebrow: "The things you fixed",
    title: "Repairs and service should not disappear after the technician leaves.",
    body:
      "A service visit becomes part of the history of the home. Keep track of what was done, when it happened and what might need attention next.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1400&q=90",
  },
  {
    eyebrow: "The things you proved",
    title: "Receipts, warranties and invoices are only useful if you can find them.",
    body:
      "Keep important proof together so you are not searching through old emails, drawers and filing cabinets when something goes wrong.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=90",
  },
];

const timeline = [
  {
    year: "2026",
    title: "Moved in",
    note: "Home record started",
  },
  {
    year: "2027",
    title: "Refrigerator replaced",
    note: "Receipt + warranty saved",
  },
  {
    year: "2028",
    title: "HVAC serviced",
    note: "Service history added",
  },
  {
    year: "2029",
    title: "Water heater replaced",
    note: "New appliance details added",
  },
  {
    year: "2030",
    title: "Roof repaired",
    note: "Invoice and contractor saved",
  },
];

export default function WhatItRemembersPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#152335]/[0.06]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90"
            alt="A lived-in modern home interior"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1ea]/96 via-[#f5f1ea]/82 to-[#f5f1ea]/20" />
        </div>

        <div className="relative mx-auto grid min-h-[690px] max-w-[1440px] items-center px-5 py-24 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="max-w-[690px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152335]/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f7d8b] backdrop-blur">
              <Home className="h-4 w-4" />
              Your Home Record
            </div>

            <h1 className="font-serif text-[54px] leading-[0.96] tracking-[-0.05em] sm:text-[72px] lg:text-[84px]">
              Your home keeps
              <br />
              more history than
              <br />
              you realize.
            </h1>

            <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#5f6e80] sm:text-xl">
              Every appliance you replace, every repair you make,
              every receipt you save and every warranty you forget
              about becomes part of the story of the home.
            </p>

            <p className="mt-4 max-w-[620px] font-serif text-2xl italic leading-9 text-[#2f4051]">
              Home Tech Vault gives that story one place to live.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#24384c]"
              >
                Start Your Home Record
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/12 bg-white/55 px-7 py-4 text-sm font-semibold text-[#152335] backdrop-blur transition hover:bg-white"
              >
                See It In Action
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS THAT DISAPPEAR */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[34px] bg-[#e9e4dc]">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1500&q=90"
              alt="Receipts and paperwork on a table"
              className="min-h-[520px] w-full object-cover"
            />

            <div className="absolute bottom-6 left-6 rounded-[22px] bg-[#fffdf9]/92 p-5 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#87909b]">
                Still looking?
              </p>

              <p className="mt-2 font-serif text-2xl">
                Dishwasher receipt
              </p>

              <p className="mt-1 text-sm text-[#687486]">
                Maybe in email. Maybe in a drawer.
              </p>
            </div>
          </div>

          <div className="max-w-[560px]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7c8792]">
              The details that disappear first
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Most home information does not get lost all at once.
            </h2>

            <p className="mt-7 text-lg leading-8 text-[#667486]">
              It gets scattered slowly. A manual goes into one drawer.
              A receipt stays in an inbox. A warranty card ends up in
              a box. A service date lives in your memory until it does not.
            </p>

            <p className="mt-6 font-serif text-2xl italic leading-9">
              HTV is the place where those pieces stay together.
            </p>
          </div>
        </div>
      </section>

      {/* EDITORIAL STORY BLOCKS */}
      <section className="bg-[#ebe9e3] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              The things that make up a home
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              The record grows as the home does.
            </h2>

            <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-[#687486]">
              Not as a list of features, but as the useful history of
              the place you live.
            </p>
          </div>

          <div className="mt-18 space-y-8">
            {storyBlocks.map((block, index) => (
              <article
                key={block.eyebrow}
                className={[
                  "grid overflow-hidden rounded-[34px] bg-[#fffdf9]",
                  "lg:grid-cols-2",
                ].join(" ")}
              >
                <div
                  className={
                    index % 2 === 1
                      ? "order-1 lg:order-2"
                      : ""
                  }
                >
                  <img
                    src={block.image}
                    alt={block.title}
                    className="h-full min-h-[420px] w-full object-cover"
                  />
                </div>

                <div
                  className={[
                    "flex flex-col justify-center px-8 py-14 sm:px-12 lg:px-16",
                    index % 2 === 1
                      ? "order-2 lg:order-1"
                      : "",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8894]">
                    {block.eyebrow}
                  </p>

                  <h3 className="mt-4 font-serif text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl">
                    {block.title}
                  </h3>

                  <p className="mt-6 max-w-[540px] text-lg leading-8 text-[#667486]">
                    {block.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[720px]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
                Over the years
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                A home changes.
                <br />
                Its record should change with it.
              </h2>
            </div>

            <p className="max-w-[430px] text-lg leading-8 text-[#687486]">
              Every repair, replacement and improvement adds another
              chapter to the home.
            </p>
          </div>

          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-3 hidden h-px bg-[#152335]/20 md:block" />

            <div className="grid gap-5 md:grid-cols-5">
              {timeline.map((item) => (
                <div
                  key={item.year}
                  className="relative"
                >
                  <div className="relative z-10 mb-5 hidden h-6 items-center md:flex">
                    <div className="h-3 w-3 rounded-full bg-[#152335]" />
                  </div>

                  <div className="rounded-[24px] border border-[#152335]/[0.07] bg-[#fbfaf7] p-6">
                    <p className="text-sm font-semibold text-[#152335]">
                      {item.year}
                    </p>

                    <h3 className="mt-6 font-serif text-2xl">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#6e7a89]">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUESTIONS */}
      <section className="bg-[#e6ecef] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#73808c]">
              When you actually need it
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
              The answer should
              <br />
              already be there.
            </h2>

            <p className="mt-6 max-w-[500px] text-lg leading-8 text-[#657486]">
              The value of a home record shows up in ordinary moments,
              when you suddenly need one detail you have not thought
              about in years.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What model is the dishwasher?",
                a: "Bosch 800 Series — model SHPM78Z55N.",
              },
              {
                q: "Is the refrigerator still under warranty?",
                a: "Yes. Coverage runs through June 2028.",
              },
              {
                q: "When was the HVAC last serviced?",
                a: "March 14, 2028 by Wilson Heating & Air.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-[26px] bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold text-[#152335]">
                  {item.q}
                </p>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#152335] text-[10px] font-bold text-white">
                    HTV
                  </div>

                  <p className="leading-7 text-[#607083]">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL THOUGHT */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1050px] text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8ecee]">
            <FileText className="h-5 w-5" />
          </div>

          <h2 className="mt-7 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
            The useful history of your home
            should not live in a junk drawer.
          </h2>

          <p className="mx-auto mt-7 max-w-[660px] text-lg leading-8 text-[#687486]">
            Start building a home record that becomes more useful
            every year you live there.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#152335] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#24384c]"
            >
              Start Your Home Record
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-[#152335]/12 bg-white px-8 py-4 text-sm font-semibold text-[#152335] transition hover:bg-[#f3f1ec]"
            >
              See the Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
