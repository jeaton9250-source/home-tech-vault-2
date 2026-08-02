import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";

export type ComparisonRow = {
  feature: string;
  homeTechVault: string;
  competitor: string;
  homeTechVaultPositive?: boolean;
  competitorPositive?: boolean;
};

type ComparisonLandingPageProps = {
  competitorName: string;
  eyebrow: string;
  headline: string;
  summary: string;
  bestForHomeTechVault: string;
  bestForCompetitor: string;
  rows: ComparisonRow[];
  officialSourceUrl: string;
};

export default function ComparisonLandingPage({
  competitorName,
  eyebrow,
  headline,
  summary,
  bestForHomeTechVault,
  bestForCompetitor,
  rows,
  officialSourceUrl,
}: ComparisonLandingPageProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="px-5 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-6xl">
              {headline}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
              {summary}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-[28px] border border-home-health/30 bg-home-health-soft p-7">
              <p className="text-sm font-semibold text-home-health">Choose Home Tech Vault when…</p>
              <p className="mt-3 text-base leading-7 text-text-primary">{bestForHomeTechVault}</p>
            </article>
            <article className="rounded-[28px] border border-border-subtle bg-surface-card p-7 shadow-sm">
              <p className="text-sm font-semibold text-text-primary">Choose {competitorName} when…</p>
              <p className="mt-3 text-base leading-7 text-text-secondary">{bestForCompetitor}</p>
            </article>
          </div>

          <div className="mt-10 overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-sm">
            <div className="grid grid-cols-[1.25fr_1fr_1fr] border-b border-border-subtle bg-surface-sunken px-5 py-4 text-sm font-semibold text-text-primary">
              <span>Comparison</span>
              <span>Home Tech Vault</span>
              <span>{competitorName}</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.25fr_1fr_1fr] gap-3 border-b border-border-subtle px-5 py-5 text-sm last:border-0"
              >
                <strong className="text-text-primary">{row.feature}</strong>
                <span className="flex items-start gap-2 text-text-secondary">
                  {row.homeTechVaultPositive === false ? (
                    <Minus size={16} className="mt-0.5 shrink-0 text-text-muted" />
                  ) : (
                    <Check size={16} className="mt-0.5 shrink-0 text-home-health" />
                  )}
                  {row.homeTechVault}
                </span>
                <span className="flex items-start gap-2 text-text-secondary">
                  {row.competitorPositive === false ? (
                    <Minus size={16} className="mt-0.5 shrink-0 text-text-muted" />
                  ) : (
                    <Check size={16} className="mt-0.5 shrink-0 text-home-health" />
                  )}
                  {row.competitor}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-sunken p-5 text-sm leading-7 text-text-secondary">
            This comparison focuses on product purpose and publicly described features.
            Competitor features can change. Review the competitor&apos;s{" "}
            <a
              href={officialSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-interaction underline underline-offset-4"
            >
              official website
            </a>{" "}
            before making a purchase decision.
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-6 py-3 font-semibold text-white"
            >
              Start Home Tech Vault Free
              <ArrowRight size={16} className="ml-2" aria-hidden />
            </Link>
            <Link
              href="/compare"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle bg-surface-card px-6 py-3 font-semibold text-text-primary"
            >
              View all comparisons
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
