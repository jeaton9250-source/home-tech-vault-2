import LandingScrollReveal from "@/components/landing/LandingScrollReveal";
import { landingHomeStories } from "@/lib/marketing/landingContent";
import {
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import { cn } from "@/lib/design-system/cn";

function StoryIllustration({
  storyId,
}: {
  storyId: (typeof landingHomeStories)[number]["id"];
}) {
  const shapes = {
    tv: (
      <>
        <div className="absolute left-5 top-5 h-16 w-24 rounded-xl border border-amber-200/50 bg-white/80 shadow-sm" />
        <div className="absolute bottom-6 right-6 h-10 w-14 rounded-lg border border-amber-200/40 bg-amber-50/90" />
      </>
    ),
    manual: (
      <>
        <div className="absolute left-6 top-6 h-20 w-16 rounded-lg border border-sky-200/50 bg-white/85 shadow-sm" />
        <div className="absolute bottom-7 right-5 h-3 w-20 rounded-full bg-sky-100/90" />
        <div className="absolute bottom-11 right-5 h-3 w-16 rounded-full bg-sky-100/70" />
      </>
    ),
    wifi: (
      <>
        <div className="absolute left-1/2 top-6 h-10 w-10 -translate-x-1/2 rounded-full border border-emerald-200/50 bg-white/85" />
        <div className="absolute left-1/2 top-10 h-16 w-16 -translate-x-1/2 rounded-full border border-emerald-200/30" />
        <div className="absolute bottom-6 left-5 h-9 w-9 rounded-2xl border border-emerald-200/40 bg-emerald-50/80" />
        <div className="absolute bottom-6 right-5 h-9 w-9 rounded-2xl border border-emerald-200/40 bg-emerald-50/80" />
      </>
    ),
    warranty: (
      <>
        <div className="absolute left-6 top-7 h-14 w-20 rounded-2xl border border-rose-200/50 bg-white/85 shadow-sm" />
        <div className="absolute bottom-7 right-6 h-8 w-8 rounded-full border border-rose-200/40 bg-rose-50/90" />
      </>
    ),
  } as const;

  return (
    <div
      className="relative mx-auto aspect-[5/3] w-full max-w-[15rem] overflow-hidden rounded-[1.15rem] border border-white/60 bg-white/30"
      aria-hidden
    >
      {shapes[storyId]}
    </div>
  );
}

export default function LandingRealHomesSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.forHomes}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "border-y border-border-subtle/70 bg-surface-sunken/30 px-8 py-16 md:py-20 lg:px-10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <LandingScrollReveal className="max-w-2xl">
          <p className="text-overline text-text-muted">
            For real homes
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Built for real homes.
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            Take care of your home with confidence. We&apos;ll remember
            the little things.
          </p>
        </LandingScrollReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {landingHomeStories.map((story, index) => (
            <LandingScrollReveal
              key={story.id}
              delayMs={index * 80}
            >
              <article
                className={cn(
                  "htv-card-interactive group h-full overflow-hidden rounded-[1.25rem] border bg-surface-card p-6 shadow-[var(--shadow-sm)] ring-1 md:p-8",
                  `bg-gradient-to-br ${story.accent}`,
                  story.ring
                )}
              >
                <StoryIllustration storyId={story.id} />

                <div className="mt-6">
                  <p className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                    {story.prompt}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {story.response}
                  </p>
                </div>
              </article>
            </LandingScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
