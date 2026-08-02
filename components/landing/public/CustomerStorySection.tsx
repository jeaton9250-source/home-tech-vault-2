import { ArrowRight } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import { CUSTOMER_STORY } from "@/lib/marketing/customerStory";

export default function CustomerStorySection() {
  if (!CUSTOMER_STORY.enabled) {
    return null;
  }

  return (
    <section className="bg-surface-sunken px-5 py-20 md:px-8 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        <div className="rounded-[32px] border border-border-subtle bg-surface-card p-8 shadow-sm md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
            Customer story
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl">
            {CUSTOMER_STORY.headline}
          </h2>
          <p className="mt-4 text-sm font-semibold text-text-muted">
            {CUSTOMER_STORY.firstName} · {CUSTOMER_STORY.location}
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
            <article className="rounded-3xl border border-border-subtle bg-surface-sunken p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                Before
              </p>
              <p className="mt-3 leading-7 text-text-secondary">{CUSTOMER_STORY.before}</p>
            </article>
            <div className="flex items-center justify-center">
              <ArrowRight size={24} className="text-home-health" aria-hidden />
            </div>
            <article className="rounded-3xl border border-home-health/20 bg-home-health-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-home-health">
                After
              </p>
              <p className="mt-3 leading-7 text-text-primary">{CUSTOMER_STORY.after}</p>
            </article>
          </div>

          <p className="mt-6 rounded-2xl bg-charcoal px-5 py-4 text-sm font-semibold text-white">
            Result: {CUSTOMER_STORY.result}
          </p>
        </div>
      </div>
    </section>
  );
}
