"use client";

import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import PageCard from "@/components/ui/PageCard";
import HomeHealthHighlights from "@/components/home-health/HomeHealthHighlights";
import HomeHealthScoreRing from "@/components/home-health/HomeHealthScoreRing";
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
  statusMessage,
  highlights,
}: HomeHealthScoreCardProps) {
  return (
    <PageCard className="bg-surface-card">
      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <HomeHealthScoreRing
          score={score}
          status={status}
          statusMessage={statusMessage}
        />

        <div className="space-y-4">
          <div>
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
      </div>
    </PageCard>
  );
}
