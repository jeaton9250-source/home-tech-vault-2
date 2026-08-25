type HealthScoreRingProps = {
  score: number;
  label?: string;
};

export default function HealthScoreRing({
  score,
  label = "Home Tech Health",
}: HealthScoreRingProps) {
  const safeScore = Math.max(
    0,
    Math.min(100, score)
  );

  return (
    <div
      className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full p-[10px]"
      style={{
        background: `conic-gradient(#718d4f ${safeScore}%, rgba(238,233,223,0.12) ${safeScore}% 100%)`,
      }}
      role="img"
      aria-label={`${label}: ${safeScore} out of 100`}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#183047] text-center shadow-inner">
        <span className="font-serif text-5xl font-medium tracking-[-0.04em] text-[#f5f1e8]">
          {safeScore}
        </span>

        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
          / 100
        </span>
      </div>
    </div>
  );
}
