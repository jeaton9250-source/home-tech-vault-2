"use client";

import {
  CheckCircle2,
  FileText,
  FolderCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import type { VaultScoreResult } from "@/lib/calculateVaultScore";

type TechnologyScoreCardProps = {
  score: VaultScoreResult;
};

export default function TechnologyScoreCard({
  score,
}: TechnologyScoreCardProps) {
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;

  const progressOffset =
    circumference -
    (Math.min(Math.max(score.total, 0), 100) / 100) *
      circumference;

  return (
    <section className="rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EAD7] text-[#8A6A2F]">
          <Sparkles size={21} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Vault Intelligence
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#111827]">
            Technology Score
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-40 w-40">
            <svg
              viewBox="0 0 128 128"
              className="h-full w-full -rotate-90"
            >
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="none"
                stroke="#EFECE5"
                strokeWidth="10"
              />

              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                fill="none"
                stroke="#111827"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                className="transition-all duration-700"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-[#111827]">
                {score.total}
              </p>

              <p className="text-sm text-neutral-400">
                out of 100
              </p>
            </div>
          </div>

          <p className="mt-4 text-lg font-bold text-[#111827]">
            {score.label}
          </p>
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreCategory
              label="Protection"
              value={score.protection}
              icon={ShieldCheck}
            />

            <ScoreCategory
              label="Organization"
              value={score.organization}
              icon={FolderCheck}
            />

            <ScoreCategory
              label="Documentation"
              value={score.documentation}
              icon={FileText}
            />

            <ScoreCategory
              label="Maintenance"
              value={score.maintenance}
              icon={Wrench}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-[#F7F5EF] p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-[#C8A96A]"
              />

              <h3 className="font-bold text-[#111827]">
                Improve Your Score
              </h3>
            </div>

            {score.recommendations.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">
                Your vault is fully documented and organized.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {score.recommendations.map(
                  (recommendation) => (
                    <li
                      key={recommendation}
                      className="flex items-start gap-3 text-sm text-neutral-600"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C8A96A]" />

                      {recommendation}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type ScoreCategoryProps = {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
};

function ScoreCategory({
  label,
  value,
  icon: Icon,
}: ScoreCategoryProps) {
  return (
    <div className="rounded-2xl border border-[#E8E2D6] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-neutral-500">
          <Icon size={17} />
          <p className="text-sm font-semibold">{label}</p>
        </div>

        <p className="font-bold text-[#111827]">
          {value}%
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EFECE5]">
        <div
          className="h-full rounded-full bg-[#111827] transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}