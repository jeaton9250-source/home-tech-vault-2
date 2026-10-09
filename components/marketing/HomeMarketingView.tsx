"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Check, FileText, ShieldCheck, Wrench } from "lucide-react";
import { Header, Footer } from "./PremiumHomeChrome";
import type { HomepageContent } from "@/lib/cms/schema";
import styles from "./PremiumHome.module.css";

const images = {
  hero: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
  paperwork:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=90",
  break:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",
  service:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85",
  proof:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
  sell: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
};

const moments = [
  [
    images.break,
    "When something breaks",
    "Find the model, manual, receipt and warranty fast.",
  ],
  [
    images.service,
    "When something needs service",
    "See what was done before and when it was last handled.",
  ],
  [
    images.proof,
    "When you need proof",
    "Keep documents, serial numbers and receipts together.",
  ],
  [
    images.sell,
    "When you sell your home",
    "Pass along the story and records that belong with it.",
  ],
];

export default function HomeMarketingView({
  content,
}: {
  content: HomepageContent;
}) {
  const [selectedMoment, setSelectedMoment] = useState("Manuals");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const revealItems =
      document.querySelectorAll<HTMLElement>("[data-htv-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="top" className={`${styles.page} bg-[#FFFDF8] text-[#17212A]`}>
      <Header signupLink={content.primaryLink} />
      <div className="bg-[#F5F1E8] px-5 pb-5 pt-[4.5rem]">
        <div className="mx-auto max-w-[760px] rounded-2xl border border-[#DED7CA] bg-[#F5F1E8] px-5 py-4 text-center text-[#183047] shadow-[0_10px_28px_rgba(24,48,71,0.10)]">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#617C43]"
            />
            {content.announcement ||
              "Home Tech Vault is now available on the App Store."}
          </p>
          <p className="mt-1 text-xs text-[#59625D]">
            A smarter home record, always within reach.
          </p>
        </div>
      </div>
      <section
        id="start"
        data-htv-reveal
        className="relative overflow-hidden bg-[#F5F1E8] px-5 pb-16 pt-20 text-center lg:pb-24 lg:pt-28"
      >
        <div className="mx-auto max-w-[900px]">
          <p className="text-sm font-medium text-[#59625D]">
            {content.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(3.6rem,9vw,8.5rem)] font-semibold leading-[.92] tracking-[-0.075em]">
            {content.headline.split("\n").map((line, index) => (
              <span
                key={index}
                className={`block ${index ? "text-[#59625D]" : ""}`}
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-[#59625D]">
            {content.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={content.primaryLink}
              className="rounded-full bg-[#183047] px-6 py-3 text-sm font-medium text-[#FFFDF8] hover:bg-[#40502F]"
            >
              {content.primaryLabel}{" "}
              <ArrowRight className="ml-2 inline size-4" />
            </a>
            <a
              href="#explore"
              className="rounded-full px-6 py-3 text-sm font-medium text-[#1a1a1a] hover:underline"
            >
              See how it works
            </a>
          </div>
          {content.showAppStore ? (
            <a
              href={content.appStoreLink}
              aria-label="Download Home Tech Vault on the App Store"
              className="group mx-auto mt-6 flex w-fit items-center gap-3 rounded-2xl border border-[#183047]/15 bg-[#FFFDF8]/80 px-4 py-3 text-left text-[#183047] shadow-[0_12px_30px_rgba(24,48,71,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#617C43]/40 hover:bg-[#FFFDF8] hover:shadow-[0_16px_34px_rgba(24,48,71,0.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#617C43]"
            >
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-[#183047] text-[#FFFDF8] shadow-sm transition duration-300 group-hover:bg-[#617C43]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M17.05 12.54c-.02-2.25 1.84-3.34 1.92-3.39-1.05-1.53-2.68-1.74-3.25-1.76-1.38-.14-2.72.81-3.42.81-.71 0-1.81-.79-2.97-.77-1.52.02-2.92.88-3.7 2.22-1.6 2.77-.41 6.84 1.13 9.08.75 1.1 1.63 2.32 2.79 2.28 1.12-.05 1.54-.73 2.9-.73 1.35 0 1.73.73 2.9.7 1.2-.02 1.96-1.1 2.69-2.2.84-1.25 1.19-2.46 1.21-2.52-.03-.01-2.18-.84-2.2-3.72ZM14.79 5.92c.62-.75 1.04-1.8.92-2.84-.89.04-1.96.59-2.6 1.34-.57.66-1.08 1.73-.94 2.74.99.08 2-.5 2.62-1.24Z" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#59625D]">
                  Download on the
                </span>
                <span className="block text-base font-semibold tracking-[-0.02em]">
                  App Store
                </span>
              </span>
              <ArrowRight className="ml-1 size-4 text-[#617C43] transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          ) : null}
        </div>
        <div className="relative mx-auto mt-16 aspect-[16/8] max-w-[1200px] overflow-hidden rounded-[28px] shadow-2xl shadow-black/15">
          <Image
            src={content.heroImage}
            alt="Bright modern home interior"
            fill
            unoptimized
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>
      <section
        id="remember"
        data-htv-reveal
        className="mx-auto max-w-[1200px] px-5 py-24 lg:py-36"
      >
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[#59625D]">
              Everything your home needs
            </p>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[.95] tracking-[-0.06em]">
              Beautifully
              <br />
              organized.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#59625D]">
              Home Tech Vault brings the scattered pieces of homeownership
              together in one calm, searchable place.
            </p>
            <div className="mt-9 grid max-w-md grid-cols-2 gap-3 text-sm">
              <button
                type="button"
                aria-pressed={selectedMoment === "Manuals"}
                onClick={() => setSelectedMoment("Manuals")}
                className="rounded-2xl bg-[#F5F1E8] p-4 text-left transition hover:-translate-y-1 hover:bg-[#DED7CA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#617C43]"
              >
                <FileText className="mb-3 size-5" />
                Manuals
              </button>
              <button
                type="button"
                aria-pressed={selectedMoment === "Receipts"}
                onClick={() => setSelectedMoment("Receipts")}
                className="rounded-2xl bg-[#F5F1E8] p-4 text-left transition hover:-translate-y-1 hover:bg-[#DED7CA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#617C43]"
              >
                <Check className="mb-3 size-5" />
                Receipts
              </button>
              <button
                type="button"
                aria-pressed={selectedMoment === "Warranties"}
                onClick={() => setSelectedMoment("Warranties")}
                className="rounded-2xl bg-[#F5F1E8] p-4 text-left transition hover:-translate-y-1 hover:bg-[#DED7CA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#617C43]"
              >
                <ShieldCheck className="mb-3 size-5" />
                Warranties
              </button>
              <button
                type="button"
                aria-pressed={selectedMoment === "Maintenance"}
                onClick={() => setSelectedMoment("Maintenance")}
                className="rounded-2xl bg-[#F5F1E8] p-4 text-left transition hover:-translate-y-1 hover:bg-[#DED7CA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#617C43]"
              >
                <Wrench className="mb-3 size-5" />
                Maintenance
              </button>
            </div>
            <p
              className="mt-5 rounded-2xl border border-[#DED7CA] bg-[#FFFDF8] p-4 text-sm text-[#59625D]"
              aria-live="polite"
            >
              <span className="block text-xs uppercase tracking-wider">
                Sample home record
              </span>
              <span className="mt-2 block font-semibold text-[#183047]">
                {selectedMoment}
              </span>
              <span className="mt-2 block">
                {
                  {
                    Manuals:
                      "Kitchen refrigerator · Owner’s manual saved and ready to find.",
                    Receipts:
                      "Kitchen refrigerator · Purchase receipt stored with the device.",
                    Warranties:
                      "Kitchen refrigerator · Coverage ends June 15, 2028.",
                    Maintenance:
                      "HVAC system · Filter replacement due November 1, 2026.",
                  }[selectedMoment]
                }
              </span>
            </p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[28px]">
            <Image
              src={images.paperwork}
              alt="Organized home paperwork"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
      <section
        id="explore"
        data-htv-reveal
        className="bg-[#F5F1E8] px-5 py-24 lg:py-36"
      >
        <div className="mx-auto max-w-[1200px]">
          <p className="text-sm font-medium text-[#59625D]">
            Made for real life
          </p>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[.95] tracking-[-0.06em]">
              Helpful when
              <br />
              it matters.
            </h2>
            <p className="max-w-sm text-lg leading-8 text-[#59625D]">
              The details are easy to forget. Finding them shouldn&apos;t be.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {moments.map(([src, title, body]) => (
              <article key={title}>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={src}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#59625D]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        id="realtors"
        data-htv-reveal
        className="bg-[#183047] px-5 py-24 text-[#FFFDF8] lg:py-36"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[#DED7CA]">
              For the people who make a house a home
            </p>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[.95] tracking-[-0.06em]">
              Every update.
              <br />
              One home history.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#DED7CA]">
              Keep renovation documents, appliance purchases, and service
              records together, so your home’s important details stay easy to
              find.
            </p>
            <a
              href={content.primaryLink}
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1a1a1a]"
            >
              {content.primaryLabel} <ArrowRight className="ml-2 size-4" />
            </a>
          </div>
          <div className="rounded-[28px] bg-[#40502F] p-7">
            <p className="text-xs uppercase tracking-wider text-[#DED7CA]">
              Illustrative home history
            </p>
            {[
              ["2026", "Refrigerator added"],
              ["2027", "HVAC service record saved"],
              ["2028", "Kitchen renovation documented"],
            ].map(([year, item]) => (
              <div
                key={year}
                className="flex justify-between border-b border-[#DED7CA]/20 py-5 text-sm last:border-0"
              >
                <span className="text-[#DED7CA]">{year}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" data-htv-reveal className="px-5 py-24 lg:py-36">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-10 rounded-[28px] bg-[#F5F1E8] p-8 md:p-14 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#59625D]">
              Simple by design
            </p>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[.95] tracking-[-0.06em]">
              {content.finalHeadline.split("\n").map((line, index) => (
                <span className="block" key={index}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#59625D]">
              {content.finalDescription}
            </p>
          </div>
          <div>
            <p className="text-4xl font-semibold tracking-[-0.04em]">
              Free to start.
            </p>
            <a
              href={content.primaryLink}
              className="mt-5 inline-flex rounded-full bg-[#183047] px-6 py-3 text-sm font-medium text-[#FFFDF8]"
            >
              {content.primaryLabel} <ArrowRight className="ml-2 size-4" />
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
