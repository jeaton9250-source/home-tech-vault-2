type LuxuryHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  score?: number;
  action?: React.ReactNode;
};

export default function LuxuryHero({
  eyebrow,
  title,
  description,
  score,
  action,
}: LuxuryHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] bg-neutral-950 p-10 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/50">
            {eyebrow}
          </p>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
              {description}
            </p>

            {action && <div className="mt-8">{action}</div>}
          </div>

          {typeof score === "number" && (
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-white/60">Technology Health</p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-6xl font-semibold">{score}</span>
                <span className="mb-2 text-white/50">/100</span>
              </div>

              <div className="mt-5 h-2 rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="mt-4 text-sm text-white/60">
                {score >= 90
                  ? "Excellent"
                  : score >= 75
                  ? "Good"
                  : "Needs attention"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}