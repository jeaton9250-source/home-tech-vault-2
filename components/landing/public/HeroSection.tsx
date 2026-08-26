"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Home,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type HeroSectionProps = {
  isSignedIn: boolean;
};

const slides = [
  {
    label: "Home",
    eyebrow: "Your home at a glance",
    title: "Everything important, visible in one place.",
    description:
      "See your devices, warranties, documents, household details, Vault Readiness, and home insights from one dashboard.",
    image: "/marketing/home-dashboard-full.png",
    alt: "Home Tech Vault home dashboard showing vault readiness, devices, warranties, documents, Home Advisor, and Ask Your Vault",
  },
  {
    label: "Devices",
    eyebrow: "Every device has a home",
    title: "Keep the details you will need later.",
    description:
      "Organize appliances and technology with model numbers, purchase details, warranties, documents, locations, and more.",
    image: "/marketing/devices-dashboard-v2.png",
    alt: "Home Tech Vault devices page showing organized home appliances and technology",
  },
  {
    label: "Home Wi-Fi",
    eyebrow: "Know your home network",
    title: "Your Wi-Fi information, documented.",
    description:
      "Keep important home network details organized alongside the rest of your home instead of scattered across notes and router labels.",
    image: "/marketing/home-wifi-dashboard.png",
    alt: "Home Tech Vault Home Wi-Fi page showing organized home network information",
  },
];

export default function HeroSection({
  isSignedIn,
}: HeroSectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Start My Home Vault";

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  const slide = slides[activeSlide];

  return (
    <section
      className="overflow-hidden bg-[#f5f1e8]"
      style={{
        padding: "64px 48px 54px",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* HERO COPY */}
        <div
          style={{
            width: "100%",
            maxWidth: "940px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#17212a]/10 bg-[#fffdf8] px-4 py-2 shadow-sm">
            <Home size={14} className="text-[#617c43]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              A simpler way to remember your home
            </span>
          </div>

          <h1
            style={{
              marginTop: "28px",
              maxWidth: "940px",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "clamp(52px, 5.5vw, 82px)",
              lineHeight: "0.98",
              letterSpacing: "-0.055em",
              fontWeight: 500,
            }}
            className="font-serif text-[#17212a]"
          >
            Your home comes with{" "}
            <span className="text-[#617c43]">
              a lot to remember.
            </span>
          </h1>

          <p
            style={{
              marginTop: "24px",
              maxWidth: "720px",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "18px",
              lineHeight: "1.75",
            }}
            className="text-[#68716c]"
          >
            Keep the receipts, warranties, manuals, appliances,
            maintenance records, and important details you&apos;ll
            want later in one simple place.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-8 text-[15px] font-semibold text-white shadow-[0_18px_38px_-22px_rgba(97,124,67,0.9)] transition hover:-translate-y-0.5 hover:bg-[#718d4f]"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>

            <Link
              href={MARKETING_ROUTES.demo}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#17212a]/15 bg-[#fffdf8]/80 px-8 text-[15px] font-semibold text-[#17212a] transition hover:bg-[#fffdf8]"
            >
              See an Example
            </Link>
          </div>
        </div>

        {/* PRODUCT TOUR */}
        <div
          className="mx-auto mt-16 w-full max-w-[1180px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#617c43]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
              Inside Home Tech Vault
            </span>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`rounded-full px-5 py-2.5 text-[12px] font-semibold transition ${
                  index === activeSlide
                    ? "bg-[#17212a] text-white shadow-md"
                    : "border border-[#17212a]/10 bg-[#fffdf8] text-[#68716c] hover:border-[#617c43]/30 hover:text-[#17212a]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-16 rounded-full bg-[#617c43]/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-[#17212a]/10 bg-[#fffdf8] p-3 shadow-[0_40px_100px_-35px_rgba(23,33,42,0.35)]">
              {/* Screenshot stage */}
              <div className="relative flex h-[520px] items-start justify-center overflow-hidden rounded-[28px] bg-[#eee9df] sm:h-[620px] md:h-[720px] lg:h-[820px]">
                {slides.map((item, index) => (
                  <div
                    key={item.image}
                    className={`absolute inset-0 flex items-start justify-center transition-all duration-700 ease-out ${
                      index === activeSlide
                        ? "translate-x-0 opacity-100"
                        : index < activeSlide
                          ? "-translate-x-6 opacity-0"
                          : "translate-x-6 opacity-0"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.alt}
                      width={1400}
                      height={1200}
                      priority={index === 0}
                      quality={90}
                      sizes="(min-width: 1200px) 1180px, 94vw"
                      className="h-full w-full object-contain object-top"
                    />
                  </div>
                ))}
              </div>

              {/* Arrows */}
              <button
                type="button"
                onClick={previousSlide}
                aria-label="Previous product screenshot"
                className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#17212a]/10 bg-[#fffdf8]/95 text-[#17212a] shadow-lg backdrop-blur transition hover:scale-105"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next product screenshot"
                className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#17212a]/10 bg-[#fffdf8]/95 text-[#17212a] shadow-lg backdrop-blur transition hover:scale-105"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Slide description */}
          <div className="mx-auto mt-7 max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
              {slide.eyebrow}
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#17212a] md:text-3xl">
              {slide.title}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#68716c]">
              {slide.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-label={`Show ${item.label}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeSlide
                    ? "w-8 bg-[#617c43]"
                    : "w-2 bg-[#17212a]/20 hover:bg-[#17212a]/35"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          section {
            padding: 48px 20px 42px !important;
          }
        }
      `}</style>
    </section>
  );
}
