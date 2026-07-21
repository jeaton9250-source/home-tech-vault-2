"use client";

import PageCard from "@/components/ui/PageCard";
import HomeHealthHighlights from "@/components/home-health/HomeHealthHighlights";
import HomeHealthScoreRing from "@/components/home-health/HomeHealthScoreRing";
import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import { getHomeHealthDisplayMessage } from "@/lib/home-health/display";
import type {
  HomeHealthHighlight,
  HomeHealthStatusLabel,
} from "@/lib/home-health/types";

type HomeHealthScoreCardProps = {
  score: number;
  status: HomeHealthStatusLabel;
  statusMessage: string;
  highlights: HomeHealthHighlight[];
};

export default function HomeHealthScoreCard({
  score,
  status,
  highlights,
}: HomeHealthScoreCardProps) {
  const animatedScore =
    useAnimatedNumber(score);
  const displayMessage =
    getHomeHealthDisplayMessage(status);

  return (
    <PageCard className="bg-surface-card">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-overline text-home-health">
              Home Health
            </p>

            <div>
              <p
                className="text-[clamp(4rem,10vw,5.5rem)] font-medium tabular-nums leading-none tracking-[-0.04em] text-text-primary"
                aria-hidden
              >
                {animatedScore}
                <span className="text-[0.42em] font-medium text-text-secondary">
                  %
                </span>
              </p>
              <p className="sr-only">
                Home Health score:{" "}
                {score} percent, {status}
              </p>
            </div>

            <div>
              <p className="text-base font-medium text-text-primary md:text-lg">
                {status}
              </p>
              <p className="mt-1 max-w-md text-[0.9375rem] leading-7 text-text-muted">
                {displayMessage}
              </p>
            </div>
          </div>

          <HomeHealthScoreRing
            score={score}
            status={status}
            className="mx-auto lg:mx-0"
            size={176}
          />
        </div>

        <div className="border-t border-border-subtle/80 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-2">
          <p className="text-overline text-text-muted">
            Today&apos;s highlights
          </p>

          <div className="mt-4">
            <HomeHealthHighlights
              highlights={highlights}
            />
          </div>
        </div>
      </div>
    </PageCard>
  );
}
