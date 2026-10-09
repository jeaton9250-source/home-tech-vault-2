import type React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Home,
  ShieldCheck,
  Wrench,
} from "lucide-react";
const icons = { FileText, ShieldCheck, CalendarDays, Wrench };
type SitePageProps = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  children: React.ReactNode;
};
export function SitePage({ eyebrow, title, intro, children }: SitePageProps) {
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#12233a]">
      <MarketingHeader />
      <section id="top" className="px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
            <MarketingText scope="shared">{eyebrow}</MarketingText>
          </p>
          <h1 className="max-w-5xl font-serif text-6xl leading-[0.92] tracking-[-0.055em] md:text-8xl">
            <MarketingText scope="shared">{title}</MarketingText>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#536174]">
            <MarketingText scope="shared">{intro}</MarketingText>
          </p>
          {children}
        </div>
      </section>
      <HomeMarketingFooter />
    </main>
  );
}
export function VaultGrid() {
  const items = [
    ["Manuals", FileText],
    ["Receipts", FileText],
    ["Warranties", ShieldCheck],
    ["Maintenance", CalendarDays],
    ["Documents", FileText],
  ] as const;
  return (
    <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-5">
      {items.map(([label, Icon]) => (
        <div key={label} className="bg-[#20344b] p-6 text-[#f5f2eb]">
          <Icon className="mb-10 h-5 w-5 text-[#c6c16a]" />
          <p>
            <MarketingText scope="shared">{label}</MarketingText>
          </p>
        </div>
      ))}
    </div>
  );
}
export { icons };
export { ArrowUpRight };
