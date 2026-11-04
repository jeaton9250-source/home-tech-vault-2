"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  FolderArchive,
  House,
  Layers3,
  LockKeyhole,
  Monitor,
  ShieldCheck,
  Wrench,
  Wifi,
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import LandingHeader from "@/components/landing/public/LandingHeader";
import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";

const categories = [
  { label: "Devices & appliances", Icon: Monitor },
  { label: "Receipts & manuals", Icon: FileText },
  { label: "Warranty records", Icon: ShieldCheck },
  { label: "Maintenance history", Icon: Wrench },
];

const workflow = [
  {
    n: "01",
    title: "Start with the things you own.",
    text: "Add an appliance, device, or system. Give it a name, a room, and the details worth keeping.",
    Icon: House,
  },
  {
    n: "02",
    title: "Keep the paperwork with it.",
    text: "Attach the manual, purchase receipt, warranty information, and notes to the right record.",
    Icon: FolderArchive,
  },
  {
    n: "03",
    title: "Find the answer later.",
    text: "When something needs attention, your home's useful details are already in one place.",
    Icon: CheckCircle2,
  },
];

function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={[
        "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em]",
        dark ? "text-[#9dbb77]" : "text-[#617c43]",
      ].join(" ")}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {children}
    </p>
  );
}

function MainCta({
  signedIn,
  location,
  light = false,
}: {
  signedIn: boolean;
  location: string;
  light?: boolean;
}) {
  const href = signedIn ? "/dashboard" : "/signup";
  return (
    <LandingTrackedLink
      href={href}
      eventName="marketing_cta_click"
      eventParams={{ funnel: "acquisition", location, destination: href }}
      className={[
        "group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.19)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        light
          ? "bg-[#f5f1e8] text-[#183047] focus-visible:outline-white"
          : "bg-[#718d4f] text-white hover:bg-[#819d5e] focus-visible:outline-[#718d4f]",
      ].join(" ")}
    >
      {signedIn ? "Open my vault" : "Start my free vault"}
      <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden />
    </LandingTrackedLink>
  );
}

function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div>
      <Eyebrow>{kicker}</Eyebrow>
      <h2 className="mt-5 max-w-[850px] font-serif text-[clamp(2.7rem,5.8vw,5.7rem)] font-medium leading-[1.02] tracking-[-0.047em] text-[#183047]">
        {title}
      </h2>
      {description ? (
        <p className="mt-7 max-w-[600px] text-[16px] leading-[1.85] text-[#59625d] md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function WindowDots() {
  return (
    <div className="flex items-center gap-[6px]" aria-hidden="true">
      <span className="h-[8px] w-[8px] rounded-full bg-[#d0ccc1]" />
      <span className="h-[8px] w-[8px] rounded-full bg-[#d0ccc1]" />
      <span className="h-[8px] w-[8px] rounded-full bg-[#d0ccc1]" />
    </div>
  );
}

export default function JuicyInspiredLanding() {
  const { user, loading } = useDemoMode();
  const signedIn = !loading && Boolean(user);

  return (
    <div className="overflow-x-clip bg-[#f5f1e8] text-[#183047]">
      <LandingHeader isSignedIn={signedIn} />
      <main id="main-content">
        {/* 01 — Immersive hero: original HTV visuals, inspired by the reference's scale. */}
        <section className="relative isolate overflow-hidden bg-[#12293d] px-5 pb-0 pt-20 text-[#f5f1e8] md:px-8 md:pt-28 lg:pt-32">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 18%, rgba(113,141,79,.22), transparent 72%), radial-gradient(ellipse 50% 50% at 88% 65%, rgba(105,142,151,.14), transparent 72%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[850px] opacity-[0.055]" style={{ backgroundImage: "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)", backgroundSize: "90px 90px", maskImage: "linear-gradient(to bottom,#000,transparent)" }} aria-hidden />
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a3bd82]/30 bg-[#a3bd82]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c3d6a8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9dbb77]" />
              A better memory for your home
            </div>
            <h1 className="mx-auto mt-8 max-w-[1040px] font-serif text-[clamp(3.7rem,8.5vw,8.8rem)] font-medium leading-[0.95] tracking-[-0.055em]">
              A home has a lot to <em className="font-normal text-[#a8c58d]">remember.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-[620px] text-base leading-[1.85] text-[#cad3d9] md:text-[19px]">
              Manuals, receipts, warranties, service history and the devices you depend on.
              Finally, one beautiful place to keep track of it all.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MainCta signedIn={signedIn} location="hero" />
              <LandingTrackedLink
                href="/demo"
                eventName="marketing_cta_click"
                eventParams={{ funnel: "acquisition", destination: "/demo", location: "hero" }}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore a sample home
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </LandingTrackedLink>
            </div>
            <p className="mt-5 text-[12px] tracking-[0.02em] text-[#bac6ce]">Free to start. No credit card required.</p>
          </div>

          <div className="relative mx-auto mt-20 max-w-[1170px] pb-0 md:mt-24">
            <div className="pointer-events-none absolute inset-x-[10%] bottom-0 top-[10%] rounded-full bg-[#718d4f]/25 blur-[90px]" aria-hidden />
            <div className="relative z-10 overflow-hidden rounded-t-[20px] border border-white/20 bg-[#f5f1e8] shadow-[0_-8px_95px_rgba(0,0,0,0.24)] md:rounded-t-[29px]">
              <div className="flex h-10 items-center justify-between border-b border-[#183047]/10 bg-[#fffdf8] px-5 md:h-12 md:px-7">
                <WindowDots />
                <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-[#59625d] md:text-xs">
                  <ShieldCheck size={13} aria-hidden />
                  MY HOME VAULT
                </div>
                <div className="h-4 w-10" />
              </div>
              <div className="relative bg-[#fffdf8]">
                <Image
                  src="/marketing/home-dashboard-full.png"
                  alt="Home Tech Vault product dashboard preview"
                  width={1320}
                  height={760}
                  priority
                  sizes="(max-width: 1200px) 100vw, 1170px"
                  className="block h-auto w-full"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#12293d]/20 to-transparent" aria-hidden />
              </div>
            </div>
            <div className="pointer-events-none absolute -left-3 top-[26%] z-20 hidden w-[218px] -rotate-6 rounded-2xl border border-white/20 bg-[#f8f8f2]/95 p-4 text-left shadow-[0_22px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:block" aria-hidden>
              <div className="mb-3 flex items-center gap-2 text-[#617c43]"><ShieldCheck size={16}/><span className="text-[11px] font-bold uppercase tracking-[0.12em]">Warranty</span></div>
              <p className="font-serif text-xl leading-tight text-[#183047]">Coverage in one place.</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e4e8df]"><span className="block h-full w-[68%] rounded-full bg-[#718d4f]" /></div>
              <p className="mt-2 text-[11px] text-[#59625d]">Records attached to your devices</p>
            </div>
            <div className="pointer-events-none absolute -right-4 top-[45%] z-20 hidden w-[228px] rotate-6 rounded-2xl border border-white/20 bg-[#f8f8f2]/95 p-4 text-left shadow-[0_22px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl lg:block" aria-hidden>
              <div className="flex items-center gap-2 text-[#617c43]"><CalendarDays size={16}/><span className="text-[11px] font-bold uppercase tracking-[0.12em]">Home history</span></div>
              <p className="mt-3 font-serif text-xl leading-tight text-[#183047]">A place for every service record.</p>
              <p className="mt-2 text-[11px] text-[#59625d]">From the first day to every fix.</p>
            </div>
          </div>
        </section>

        {/* 02 — Immediate feature clarity */}
        <section aria-label="What Home Tech Vault keeps" className="border-b border-[#dcd7c9] bg-[#eae5d9]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-y-1 px-5 py-7 md:grid-cols-4 md:px-8 md:py-9">
            {categories.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-3 px-2 py-3 md:justify-center md:border-r md:border-[#183047]/10 md:last:border-none">
                <Icon size={18} className="shrink-0 text-[#617c43]" strokeWidth={1.7} aria-hidden />
                <span className="text-[12px] font-semibold tracking-[0.01em] text-[#344653] md:text-[13px]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 03 — The problem, expressed with generous editorial hierarchy */}
        <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
          <LandingScrollReveal>
            <SectionTitle
              kicker="The problem is familiar"
              title={<>Your home is organized. <span className="text-[#617c43]">Your home information?</span> Not so much.</>}
            />
          </LandingScrollReveal>
          <LandingScrollReveal delayMs={100} className="lg:pt-16">
            <p className="max-w-[470px] text-lg leading-[1.9] text-[#59625d]">
              The model number is on the back. The receipt is in an inbox.
              The warranty might be in a drawer. And no one remembers
              when the filter was last changed.
            </p>
            <p className="mt-6 max-w-[470px] text-lg leading-[1.9] text-[#59625d]">
              Home Tech Vault gives those scattered details a permanent home.
              Not another complicated system. Just less to search for when life happens.
            </p>
            <LandingTrackedLink href="/how-it-works" className="mt-8 inline-flex items-center gap-2 border-b border-[#617c43] pb-1 text-sm font-semibold text-[#183047] transition hover:gap-3" eventName="marketing_cta_click" eventParams={{ location: "problem", destination: "/how-it-works" }}>
              How Home Tech Vault works <ArrowRight size={16} aria-hidden />
            </LandingTrackedLink>
          </LandingScrollReveal>
        </section>

        {/* 04 — Large real-product feature presentation */}
        <section id="features" className="bg-[#e8e8df] px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <LandingScrollReveal className="text-center">
              <Eyebrow>One home. Every detail.</Eyebrow>
              <h2 className="mx-auto mt-5 max-w-[800px] font-serif text-[clamp(3.1rem,6.6vw,6.5rem)] leading-[1.01] tracking-[-0.048em] text-[#183047]">
                A little more clarity, <em className="font-normal text-[#617c43]">room by room.</em>
              </h2>
              <p className="mx-auto mt-7 max-w-[610px] text-base leading-8 text-[#59625d] md:text-lg">
                Keep your devices and their most important details together, so finding what you need feels effortless.
              </p>
            </LandingScrollReveal>
            <LandingScrollReveal className="mt-14">
              <div className="grid overflow-hidden rounded-[28px] border border-[#d4d6cd] bg-[#fffdf8] shadow-[0_30px_90px_rgba(24,48,71,0.10)] lg:grid-cols-[.42fr_.58fr]">
                <div className="flex flex-col justify-center p-8 md:p-14 lg:p-16">
                  <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#edf2e7] text-[#617c43]"><Layers3 size={23} strokeWidth={1.7} aria-hidden /></span>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#617c43]">Your home inventory</p>
                  <h3 className="mt-4 font-serif text-[clamp(2.65rem,4vw,4.5rem)] leading-[1.04] tracking-[-0.045em]">
                    Give everything a place.
                  </h3>
                  <p className="mt-6 max-w-[370px] text-[15px] leading-[1.85] text-[#59625d]">
                    Appliances, electronics, smart-home gear, and important home systems—organized by the rooms you actually live in.
                  </p>
                  <LandingTrackedLink href="/demo" className="mt-9 inline-flex w-fit items-center gap-2 rounded-full border border-[#183047]/20 px-5 py-3 text-sm font-semibold transition hover:border-[#617c43] hover:bg-[#edf2e7]" eventName="marketing_cta_click" eventParams={{ location: "inventory_feature", destination: "/demo" }}>
                    See the sample vault <ArrowRight size={16} aria-hidden />
                  </LandingTrackedLink>
                </div>
                <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#d8e0d5] p-5 md:min-h-[480px] md:p-12">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-[390px] w-[390px] rounded-full bg-[#9aad91]/30 blur-[75px]" aria-hidden />
                  <div className="relative w-full rotate-[1.5deg] overflow-hidden rounded-xl border border-[#cbd1c5] bg-white shadow-[0_25px_60px_rgba(24,48,71,0.2)]">
                    <Image src="/marketing/home-inventory-dashboard.png" alt="Home Tech Vault home inventory screen" width={1000} height={680} sizes="(max-width: 1024px) 100vw, 600px" className="h-auto w-full" />
                  </div>
                </div>
              </div>
            </LandingScrollReveal>
          </div>
        </section>

        {/* 05 — Two editorial feature stories, drawn in HTML rather than borrowed art */}
        <section className="bg-[#f5f1e8] px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <LandingScrollReveal>
              <SectionTitle kicker="Built for the moments that matter" title={<>Useful when life <em className="font-normal text-[#617c43]">actually happens.</em></>} description="Not just a place to save files. A clearer picture of the things your home needs, right when you need them." />
            </LandingScrollReveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <LandingScrollReveal>
                <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#d7d4c8] bg-[#fffdf8]">
                  <div className="relative flex min-h-[325px] flex-col justify-center overflow-hidden bg-[#e5eadf] p-7 md:min-h-[380px] md:p-12">
                    <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#9cb48d]/25 blur-3xl" aria-hidden />
                    <div className="relative mx-auto w-full max-w-[415px] rounded-2xl border border-[#d6dfd1] bg-[#fffdf8] p-5 shadow-[0_24px_65px_rgba(24,48,71,0.13)] transition duration-500 group-hover:-translate-y-2">
                      <div className="flex items-center justify-between border-b border-[#e8e5dc] pb-4">
                        <div className="flex items-center gap-2 text-sm font-semibold"><Wrench size={17} className="text-[#617c43]"/> Refrigerator</div>
                        <span className="rounded-full bg-[#edf2e7] px-3 py-1 text-[10px] font-bold text-[#617c43]">Sample record</span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-4 text-[12px]">
                        <div><p className="text-[#7f8882]">Model</p><p className="mt-1 font-semibold">Kitchen appliance</p></div>
                        <div><p className="text-[#7f8882]">Documents</p><p className="mt-1 font-semibold">2 files attached</p></div>
                      </div>
                      <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f4f3ed] p-3 text-[12px] font-medium"><FileText size={16} className="text-[#617c43]"/> Owner's manual <Check size={15} className="ml-auto text-[#617c43]"/></div>
                      <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#f4f3ed] p-3 text-[12px] font-medium"><ShieldCheck size={16} className="text-[#617c43]"/> Warranty details <Check size={15} className="ml-auto text-[#617c43]"/></div>
                    </div>
                  </div>
                  <div className="flex-1 p-8 md:p-11">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#617c43]"><BookOpen size={15}/> Documents & warranties</div>
                    <h3 className="mt-5 font-serif text-[clamp(2.5rem,3.4vw,3.7rem)] leading-[1.06] tracking-[-0.04em]">The manual isn't missing. It's right here.</h3>
                    <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-[#59625d]">Keep receipts, serial numbers, instructions, and coverage information alongside the thing they belong to.</p>
                  </div>
                </article>
              </LandingScrollReveal>
              <LandingScrollReveal delayMs={100}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#d7d4c8] bg-[#fffdf8]">
                  <div className="relative flex min-h-[325px] flex-col justify-center overflow-hidden bg-[#d8e3e9] p-7 md:min-h-[380px] md:p-12">
                    <div className="absolute -bottom-12 right-12 h-52 w-52 rounded-full bg-[#7891aa]/25 blur-3xl" aria-hidden />
                    <div className="relative mx-auto w-full max-w-[420px] space-y-3 transition duration-500 group-hover:-translate-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-white/60 bg-[#fffdf8]/95 px-5 py-3 shadow-lg"><span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#59625d]">Home maintenance</span><CalendarDays size={17} className="text-[#617c43]"/></div>
                      {[
                        { date: "MAR", name: "HVAC filter replaced", Icon: CheckCircle2 },
                        { date: "JUN", name: "Water heater inspected", Icon: Wrench },
                        { date: "OCT", name: "Smoke alarms checked", Icon: ShieldCheck },
                      ].map(({ date, name, Icon }) => (
                        <div key={date} className="flex items-center gap-4 rounded-xl border border-white/70 bg-[#fffdf8]/95 px-5 py-4 shadow-[0_10px_25px_rgba(24,48,71,0.07)]">
                          <span className="rounded-lg bg-[#edf2e7] px-3 py-2 text-[11px] font-bold text-[#617c43]">{date}</span>
                          <span className="text-[13px] font-semibold">{name}</span>
                          <Icon size={17} className="ml-auto shrink-0 text-[#617c43]" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-8 md:p-11">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#617c43]"><Clock3 size={15}/> Maintenance history</div>
                    <h3 className="mt-5 font-serif text-[clamp(2.5rem,3.4vw,3.7rem)] leading-[1.06] tracking-[-0.04em]">Remember the work. Not the paperwork.</h3>
                    <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-[#59625d]">Build a simple record of repairs, service visits and upkeep over time. So next time, you have the context.</p>
                  </div>
                </article>
              </LandingScrollReveal>
            </div>
            <p className="mt-5 text-center text-xs text-[#7a847d]">Illustrative sample records shown. Your home and devices will be your own.</p>
          </div>
        </section>

        {/* 06 — Wide premium screenshot for the home's connected context */}
        <section className="relative isolate overflow-hidden bg-[#183047] px-5 py-24 text-[#f5f1e8] md:px-8 md:py-32">
          <div className="absolute -right-24 top-0 h-[500px] w-[500px] rounded-full bg-[#617c43]/15 blur-[110px]" aria-hidden />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <LandingScrollReveal>
              <Eyebrow dark>Beyond the paper trail</Eyebrow>
              <h2 className="mt-6 font-serif text-[clamp(3rem,5.3vw,5.6rem)] leading-[1.03] tracking-[-0.05em]">
                Even your connected home has a story.
              </h2>
              <p className="mt-7 max-w-[460px] text-base leading-[1.9] text-[#c4cfd5] md:text-lg">
                Record your network equipment, smart-home devices, and setup notes alongside the rest of your household technology.
              </p>
              <LandingTrackedLink href="/features" className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/80 hover:bg-white/10" eventName="marketing_cta_click" eventParams={{ location: "connected_home", destination: "/features" }}>
                Explore all features <ArrowRight size={16} aria-hidden />
              </LandingTrackedLink>
            </LandingScrollReveal>
            <LandingScrollReveal delayMs={90}>
              <div className="relative rounded-[25px] border border-white/15 bg-[#28445a] p-4 shadow-[0_35px_95px_rgba(0,0,0,0.28)] md:p-6">
                <div className="pointer-events-none absolute -inset-5 -z-10 rounded-full bg-[#718d4f]/15 blur-3xl" aria-hidden />
                <div className="overflow-hidden rounded-[15px] border border-white/15">
                  <Image src="/marketing/home-wifi-dashboard.png" alt="Home Tech Vault Wi-Fi and home network dashboard preview" width={1200} height={780} sizes="(max-width: 1024px) 100vw, 660px" className="h-auto w-full" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-[#dde7ed]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><Wifi size={14}/> Network notes</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><LockKeyhole size={14}/> Private home records</span>
                </div>
              </div>
            </LandingScrollReveal>
          </div>
        </section>

        {/* 07 — Three clear onboarding steps */}
        <section id="how-it-works" className="bg-[#f5f1e8] px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <LandingScrollReveal className="text-center">
              <Eyebrow>Simple from day one</Eyebrow>
              <h2 className="mx-auto mt-5 max-w-[780px] font-serif text-[clamp(3.2rem,6vw,6rem)] leading-[1.02] tracking-[-0.05em]">
                Start small. Build a home that remembers.
              </h2>
            </LandingScrollReveal>
            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {workflow.map(({ n, title, text, Icon }, i) => (
                <LandingScrollReveal key={n} delayMs={i * 75}>
                  <article className="relative h-full min-h-[315px] rounded-[24px] border border-[#ddd8cc] bg-[#fffdf8] p-8 shadow-[0_12px_40px_rgba(24,48,71,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_52px_rgba(24,48,71,0.08)] md:p-9">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl text-[#9baa90]">{n}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]"><Icon size={21} strokeWidth={1.65} aria-hidden /></span>
                    </div>
                    <h3 className="mt-12 font-serif text-[30px] leading-[1.1] tracking-[-0.035em]">{title}</h3>
                    <p className="mt-4 text-[14px] leading-[1.85] text-[#59625d]">{text}</p>
                  </article>
                </LandingScrollReveal>
              ))}
            </div>
            <div className="mt-11 text-center">
              <MainCta signedIn={signedIn} location="how_it_works" />
            </div>
          </div>
        </section>

        {/* 08 — Honest plan overview based on existing project pricing */}
        <section id="pricing" className="border-y border-[#dcd7c9] bg-[#eae7dc] px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1240px]">
            <LandingScrollReveal className="text-center">
              <Eyebrow>Room to grow</Eyebrow>
              <h2 className="mx-auto mt-5 max-w-[800px] font-serif text-[clamp(3.1rem,6vw,6rem)] leading-[1.02] tracking-[-0.05em]">
                Free to begin. Here for the long haul.
              </h2>
              <p className="mx-auto mt-6 max-w-[600px] text-base leading-8 text-[#59625d]">Start your home record today. Upgrade only when you want more storage, capabilities, or shared access.</p>
            </LandingScrollReveal>
            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
              {[
                { name: "Home", price: "$0", cadence: "forever", description: "A good home for the essentials.", features: ["Home inventory", "Basic documents", "Warranty tracking"], featured: false },
                { name: "Home Plus", price: "$7.99", cadence: "per month", description: "For a more complete home record.", features: ["Expanded document storage", "Advanced warranty tools", "Maintenance history"], featured: true },
                { name: "Household", price: "$14.99", cadence: "per month", description: "Keep the whole home on the same page.", features: ["Everything in Home Plus", "Multiple household members", "Shared household access"], featured: false },
              ].map((plan, i) => (
                <LandingScrollReveal key={plan.name} delayMs={i * 70}>
                  <article className={["relative flex h-full flex-col rounded-[25px] border p-8 md:p-9", plan.featured ? "border-[#183047] bg-[#183047] text-[#f5f1e8] shadow-[0_20px_60px_rgba(24,48,71,0.2)]" : "border-[#d4d0c4] bg-[#fffdf8] text-[#183047]"].join(" ")}>
                    {plan.featured ? <span className="absolute -top-3 left-8 rounded-full bg-[#718d4f] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">More room for your home</span> : null}
                    <p className={["text-[12px] font-bold uppercase tracking-[0.18em]", plan.featured ? "text-[#afc595]" : "text-[#617c43]"].join(" ")}>{plan.name}</p>
                    <div className="mt-7 flex items-baseline gap-2"><span className="font-serif text-[66px] leading-none tracking-[-0.05em]">{plan.price}</span><span className={["text-[12px]", plan.featured ? "text-[#c3cdd2]" : "text-[#59625d]"].join(" ")}>{plan.cadence}</span></div>
                    <p className={["mt-5 min-h-12 text-sm leading-7", plan.featured ? "text-[#d0d9dd]" : "text-[#59625d]"].join(" ")}>{plan.description}</p>
                    <div className={["my-7 h-px", plan.featured ? "bg-white/15" : "bg-[#e1ddd2]"].join(" ")} />
                    <ul className="flex-1 space-y-4">
                      {plan.features.map((f) => <li key={f} className="flex items-center gap-3 text-[13px]"><Check size={16} className={plan.featured ? "text-[#a8c58d]" : "text-[#617c43]"} aria-hidden />{f}</li>)}
                    </ul>
                    <LandingTrackedLink href={plan.name === "Home" ? (signedIn ? "/dashboard" : "/signup") : "/pricing"} className={["mt-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition hover:-translate-y-0.5", plan.featured ? "bg-[#718d4f] text-white hover:bg-[#819d5e]" : "bg-[#183047] text-white hover:bg-[#2c465c]"].join(" ")} eventName="marketing_cta_click" eventParams={{ location: "pricing_" + plan.name.toLowerCase().replaceAll(" ", "_"), destination: plan.name === "Home" ? "/signup" : "/pricing" }}>
                      {plan.name === "Home" ? "Start free" : "Explore plan"} <ArrowRight size={16} aria-hidden />
                    </LandingTrackedLink>
                  </article>
                </LandingScrollReveal>
              ))}
            </div>
            <p className="mt-7 text-center text-xs text-[#68716c]">View full plan details and current billing options on the <a href="/pricing" className="font-semibold underline underline-offset-4">pricing page</a>.</p>
          </div>
        </section>

        {/* 09 — Final CTA */}
        <section className="relative isolate overflow-hidden bg-[#13293d] px-5 py-28 text-center text-[#f5f1e8] md:px-8 md:py-40">
          <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "url('/images/home-hero.jpg')", backgroundPosition: "center 52%", backgroundSize: "cover" }} aria-hidden />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#13293d]/90 via-[#13293d]/85 to-[#13293d]" aria-hidden />
          <LandingScrollReveal>
            <Eyebrow dark>It's time everything had a place</Eyebrow>
            <h2 className="mx-auto mt-7 max-w-[940px] font-serif text-[clamp(3.4rem,7vw,7.3rem)] leading-[1.01] tracking-[-0.05em]">
              Make room for living. <em className="font-normal text-[#a8c58d]">We'll keep the details.</em>
            </h2>
            <p className="mx-auto mt-7 max-w-[560px] text-base leading-8 text-[#c9d5db] md:text-lg">One home, one place for the things you'll be glad you saved.</p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <MainCta signedIn={signedIn} location="final_cta" light />
              <LandingTrackedLink href="https://apps.apple.com/app/id6812090967" target="_blank" rel="noopener noreferrer" eventName="marketing_cta_click" eventParams={{ location: "final_cta_app_store", destination: "app_store" }} className="inline-flex items-center gap-2 text-sm font-medium text-[#d8e4eb] underline decoration-white/40 underline-offset-4 transition hover:text-white">
                Also available on the App Store <ArrowRight size={14} aria-hidden />
              </LandingTrackedLink>
            </div>
          </LandingScrollReveal>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
