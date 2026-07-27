/** Scoped Tailwind class groups for the public landing page palette. */

export const landingTheme = {
  page: "htv-public-landing min-h-screen bg-surface-base text-text-primary antialiased selection:bg-interaction-soft",
  section: "px-5 py-20 md:px-8 md:py-28 lg:px-12",
  sectionNarrow: "mx-auto max-w-6xl",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.14em] text-text-muted",
  headline:
    "text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl lg:text-[3.25rem] lg:leading-[1.06]",
  body: "text-base leading-7 text-text-secondary md:text-lg md:leading-8",
  pill: "inline-flex items-center gap-2 rounded-full border border-border-subtle/80 bg-surface-card/90 backdrop-blur-md px-4 py-2 text-xs font-semibold tracking-wide text-text-primary shadow-sm",
  card: "htv-glass-card p-6 md:p-8 transition-all duration-300 hover:shadow-md",
  cardSoft:
    "htv-glass-card-elevated p-6 md:p-8 transition-all duration-300",
  btnPrimary:
    "inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-7 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-charcoal-hover hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal",
  btnSecondary:
    "inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle bg-surface-card/90 backdrop-blur-md px-7 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all duration-200 hover:border-border-strong hover:bg-surface-hover hover:scale-[1.02] active:scale-[0.98]",
  link: "font-semibold text-interaction underline-offset-4 hover:underline hover:text-interaction-hover",
  accentText: "text-home-health",
  accentBg: "bg-home-health-soft",
  scrollAnchor: "scroll-mt-24 md:scroll-mt-28",
} as const;

