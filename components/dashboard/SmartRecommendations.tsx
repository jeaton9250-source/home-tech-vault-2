"use client";

import Link from "next/link";

import { ArrowRight, Lightbulb } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import { sections } from "@/lib/design-system/tokens";

import type { FeatureKey } from "@/lib/permissions/types";

type SmartRecommendationsProps = {
  recommendations: string[];
  deviceCount: number;
  getActionHref: (
    href: string,
    feature?: FeatureKey
  ) => string;
};

export default function SmartRecommendations({
  recommendations,
  deviceCount,
  getActionHref,
}: SmartRecommendationsProps) {
  const items =
    recommendations.length > 1
      ? recommendations.slice(1)
      : recommendations;

  return (
    <PageCard elevated interactive>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-overline"
            style={{ color: sections.insights.accent }}
          >
            Smart Recommendations
          </p>

          <h2 className="text-section-title mt-2 text-text-primary">
            Thoughtful next steps
          </h2>
        </div>

        <Link
          href="/insights"
          className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-border-subtle bg-surface-sunken/70 p-8 text-center">
          <div
            className="htv-icon-well mx-auto h-14 w-14"
            style={{
              background: sections.homeHealth.soft,
              color: sections.homeHealth.accent,
            }}
          >
            <Lightbulb size={24} />
          </div>

          <p className="mt-4 font-medium text-text-primary">
            Everything looks great today.
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
            When your vault needs attention, calm and
            practical recommendations will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken/50 px-4 py-3.5"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-surface-card"
                style={{
                  background: sections.insights.accent,
                }}
              >
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-text-secondary">
                {item}
              </p>
            </li>
          ))}
        </ul>
      )}

      {deviceCount === 0 && (
        <div className="mt-6 border-t border-border-subtle pt-6">
          <p className="text-sm text-text-muted">
            Your technology deserves a home. Start with one
            device and build from there.
          </p>

          <Button
            href={getActionHref(
              "/devices/add",
              "devices"
            )}
            className="mt-4"
            size="sm"
          >
            Add your first device
          </Button>
        </div>
      )}
    </PageCard>
  );
}
