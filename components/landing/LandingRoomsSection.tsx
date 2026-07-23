import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingRoomCards } from "@/lib/marketing/landingContent";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

export default function LandingRoomsSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.yourHome}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "border-y border-border-subtle/70 bg-surface-sunken/30 px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <LandingScrollReveal className="max-w-2xl">
          <p className="text-overline text-text-muted">
            Your home
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Your home, room by room.
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            Picture your own rooms — and everything Home Tech Vault
            quietly keeps track of.
          </p>
        </LandingScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {landingRoomCards.map((room, index) => (
            <LandingScrollReveal
              key={room.room}
              delayMs={index * 70}
            >
              <article
                className={cn(
                  "htv-room-card htv-card-interactive h-full overflow-hidden rounded-[1.25rem] border border-border-subtle/70 bg-surface-card shadow-[var(--shadow-sm)]",
                  `bg-gradient-to-br ${room.accent}`
                )}
              >
                <div className="border-b border-white/50 px-6 py-5">
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-text-primary">
                    {room.room}
                  </h3>
                </div>

                <ul className="space-y-2 px-6 py-5">
                  {room.devices.map((device) => (
                    <li
                      key={device}
                      className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-sm text-text-secondary backdrop-blur-sm"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-home-health/80"
                        aria-hidden
                      />
                      {device}
                    </li>
                  ))}
                </ul>
              </article>
            </LandingScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
