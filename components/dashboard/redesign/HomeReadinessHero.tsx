import {
  ArrowRight,
  Check,
  Home,
  MapPin,
  Sparkles,
} from "lucide-react";

const readinessItems = [
  "Core systems documented",
  "Most warranties up to date",
  "Maintenance on track",
  "Rooms beautifully organized",
];

export default function HomeReadinessHero() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[34px] bg-white shadow-[0_28px_80px_rgba(20,36,55,0.08)]">
      <div className="grid min-h-[380px] lg:grid-cols-[0.76fr_1.24fr]">

        {/* READINESS */}
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#70937a]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#81909a]">
              Home readiness
            </span>
          </div>

          <h2 className="mt-5 font-serif text-[38px] leading-[1.02] tracking-[-0.045em] text-[#142437] sm:text-[44px]">
            Your home is in
            <br />
            good shape.
          </h2>

          <p className="mt-4 max-w-[420px] text-sm leading-6 text-[#74828e]">
            The details that matter are organized, documented and easier
            to find when you need them.
          </p>

          <div className="mt-9 flex flex-col gap-8 sm:flex-row sm:items-center">
            {/* SCORE */}
            <div className="relative flex h-[148px] w-[148px] shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#7ab48a_0deg,#7ab48a_313deg,#edf1ec_313deg,#edf1ec_360deg)] p-[10px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="font-serif text-[51px] leading-none tracking-[-0.05em] text-[#142437]">
                    87
                  </p>
                  <p className="mt-1 text-[11px] text-[#8c98a2]">
                    / 100
                  </p>
                </div>
              </div>
            </div>

            {/* CHECKS */}
            <div className="space-y-3">
              {readinessItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 text-[13px] text-[#5e6f7c]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f1e7]">
                    <Check className="h-3 w-3 text-[#5b986e]" />
                  </span>

                  {item}
                </div>
              ))}

              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#edf4f6] px-5 py-3 text-xs font-semibold text-[#21374b] transition hover:bg-[#e3edef]"
              >
                View home report
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* PROPERTY VISUAL */}
        <div
          className="group relative min-h-[330px] overflow-hidden bg-[#dce6e2] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/dashboard/home-hero.jpg')",
          }}
        >
          {/* Layered fallback / photo treatment */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.08),transparent_40%),linear-gradient(90deg,rgba(223,234,231,0.92)_0%,rgba(223,234,231,0.42)_22%,rgba(20,36,55,0.03)_58%,rgba(20,36,55,0.16)_100%)]" />

          {/* Subtle fallback object */}
          <Home
            strokeWidth={0.7}
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-[#769087]/10"
          />

          <div className="absolute right-8 top-8 max-w-[265px] text-right">
            <p className="font-serif text-[29px] italic leading-[1.18] tracking-[-0.03em] text-[#526a60]/80">
              A well-documented
              <br />
              home is a calmer
              <br />
              home.
            </p>
          </div>

          {/* FLOATING HOME CARD */}
          <div className="absolute bottom-7 right-7 min-w-[190px] rounded-[22px] bg-white/92 px-5 py-4 shadow-[0_20px_55px_rgba(20,36,55,0.18)] backdrop-blur-xl">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef]">
                <MapPin className="h-4 w-4 text-[#607868]" />
              </span>

              <div>
                <p className="text-xs font-semibold text-[#142437]">
                  Your home
                </p>

                <p className="mt-1 text-[11px] leading-4 text-[#788691]">
                  Everything important,
                  <br />
                  kept together.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
