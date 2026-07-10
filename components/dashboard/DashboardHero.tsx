import { Home } from "lucide-react";

type DashboardHeroProps = {
  firstName: string;
  householdName: string;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHero({
  firstName,
  householdName,
}: DashboardHeroProps) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[#111827] p-8 text-white shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#C8A96A]">
            <Home size={18} />

            <p className="text-sm font-semibold uppercase tracking-[0.25em]">
              {householdName}
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            {getGreeting()}, {firstName}.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Everything in your digital home, organized and protected in one
            place.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Vault Status
          </p>

          <p className="mt-2 text-2xl font-semibold">Protected</p>

          <p className="mt-1 text-sm text-white/60">
            Your personal technology inventory is active.
          </p>
        </div>
      </div>
    </section>
  );
}