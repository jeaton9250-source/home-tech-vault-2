"use client";

import Link from "next/link";

import {
  ArrowRight,
  CalendarClock,
  FileQuestion,
  Laptop,
  Radar,
  ShieldAlert,
  Sparkles,
  WifiOff,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import type {
  HomeHealthHighlight,
  HomeHealthRecommendation,
  HomeHealthResult,
} from "@/lib/home-health/types";

import { cn } from "@/lib/design-system/cn";

type CommandCenterCardsProps = {
  homeHealth: HomeHealthResult;
};

type ActionCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "positive";
  count?: number;
};

function buildActionCards(
  homeHealth: HomeHealthResult
): ActionCard[] {
  const cards: ActionCard[] = [];
  const highlights = homeHealth.highlights;
  const categoryCards = homeHealth.cards;

  const devicesCard = categoryCards.find(
    (card) => card.key === "devices"
  );
  const documentsCard = categoryCards.find(
    (card) => card.key === "documents"
  );
  const warrantiesCard = categoryCards.find(
    (card) => card.key === "warranties"
  );
  const maintenanceCard = categoryCards.find(
    (card) => card.key === "maintenance"
  );

  const warningHighlights = highlights.filter(
    (item) => item.tone === "warning"
  );

  if (
    devicesCard?.status === "attention" ||
    warningHighlights.some((item) =>
      item.message.toLowerCase().includes("device")
    )
  ) {
    cards.push({
      id: "devices-attention",
      title: "Devices needing attention",
      description:
        devicesCard?.summary ||
        "Some devices need updated details or care.",
      href: "/devices",
      icon: Laptop,
      tone: "warning",
    });
  }

  cards.push({
    id: "offline-devices",
    title: "Offline devices",
    description: "See which devices are not responding on your network.",
    href: "/smart-search?q=offline+devices",
    icon: WifiOff,
    tone: "default",
  });

  if (
    maintenanceCard &&
    (maintenanceCard.status === "attention" ||
      maintenanceCard.status === "incomplete")
  ) {
    cards.push({
      id: "upcoming-maintenance",
      title: "Upcoming maintenance",
      description: maintenanceCard.summary,
      href: "/maintenance",
      icon: Wrench,
      tone:
        maintenanceCard.status === "attention"
          ? "warning"
          : "default",
    });
  }

  if (
    warrantiesCard &&
    (warrantiesCard.status === "attention" ||
      highlights.some((item) =>
        item.id.includes("warranty")
      ))
  ) {
    cards.push({
      id: "expiring-warranties",
      title: "Expiring warranties",
      description: warrantiesCard.summary,
      href: "/warranties",
      icon: ShieldAlert,
      tone: "warning",
    });
  }

  if (
    documentsCard &&
    (documentsCard.status === "attention" ||
      documentsCard.status === "incomplete")
  ) {
    cards.push({
      id: "missing-receipts",
      title: "Missing receipts",
      description:
        documentsCard.summary ||
        "Upload receipts and manuals to protect your purchases.",
      href: "/documents",
      icon: FileQuestion,
      tone: "default",
    });
  }

  cards.push({
    id: "recent-discoveries",
    title: "Recent discoveries",
    description: "Review devices found on your home network.",
    href: "/network/discovery",
    icon: Radar,
    tone: "default",
  });

  return cards.slice(0, 6);
}

export default function CommandCenterCards({
  homeHealth,
}: CommandCenterCardsProps) {
  const actionCards = buildActionCards(homeHealth);
  const recommendation = homeHealth.recommendation;

  return (
    <section className="space-y-6" aria-label="Today's priorities">
      <div>
        <p className="text-overline text-text-muted">
          What should I do today?
        </p>
        <h2 className="mt-2 text-section-title text-text-primary">
          Your home at a glance
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actionCards.map((card) => (
          <ActionCardLink key={card.id} card={card} />
        ))}
      </div>

      {recommendation ? (
        <SuggestedActionCard recommendation={recommendation} />
      ) : null}

      {homeHealth.highlights.length > 0 ? (
        <StatusSummary highlights={homeHealth.highlights} />
      ) : null}
    </section>
  );
}

function ActionCardLink({ card }: { card: ActionCard }) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className={cn(
        "group flex h-full flex-col rounded-[var(--radius-card)] border bg-surface-card p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-md",
        card.tone === "warning"
          ? "border-warning/25 hover:border-warning/40"
          : "border-border-subtle hover:border-border-strong"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle",
            card.tone === "warning"
              ? "bg-warning-soft text-warning"
              : "bg-surface-sunken text-charcoal"
          )}
        >
          <Icon size={18} />
        </span>

        <ArrowRight
          size={16}
          className="mt-1 shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-interaction"
        />
      </div>

      <h3 className="mt-4 text-base font-medium text-text-primary">
        {card.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-text-secondary">
        {card.description}
      </p>
    </Link>
  );
}

function SuggestedActionCard({
  recommendation,
}: {
  recommendation: HomeHealthRecommendation;
}) {
  return (
    <PageCard className="border-interaction/20 bg-gradient-to-br from-surface-card to-section-insights-soft/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-interaction shadow-[var(--shadow-sm)]">
            <Sparkles size={18} />
          </span>

          <div>
            <p className="text-overline text-interaction">
              Suggested action
            </p>
            <h3 className="mt-1 text-lg font-medium text-text-primary">
              {recommendation.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
              {recommendation.description}
            </p>
            <p className="mt-2 text-xs text-text-tertiary">
              About {recommendation.estimate}
            </p>
          </div>
        </div>

        <Link
          href={recommendation.href}
          className="htv-focus-ring inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-button)] border border-charcoal bg-charcoal px-4 py-2.5 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover"
        >
          Take action
          <ArrowRight size={16} />
        </Link>
      </div>
    </PageCard>
  );
}

function StatusSummary({
  highlights,
}: {
  highlights: HomeHealthHighlight[];
}) {
  return (
    <PageCard className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock size={18} className="text-text-secondary" />
        <h3 className="text-base font-medium text-text-primary">
          Home technology status
        </h3>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {highlights.map((highlight) => (
          <li
            key={highlight.id}
            className={cn(
              "rounded-[var(--radius-button)] border px-4 py-3 text-sm leading-6",
              highlight.tone === "warning"
                ? "border-warning/20 bg-warning-soft/30 text-text-secondary"
                : "border-border-subtle bg-surface-sunken/60 text-text-secondary"
            )}
          >
            {highlight.message}
          </li>
        ))}
      </ul>
    </PageCard>
  );
}
