/** Scoped Tailwind class groups for the public landing page palette. */

export const landingTheme = {
  page: "htv-public-landing min-h-screen bg-[#FAFAF8] text-[#172033]",
  section: "px-5 py-16 md:px-8 md:py-24 lg:px-10",
  sectionNarrow: "mx-auto max-w-6xl",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]",
  headline:
    "text-3xl font-medium tracking-[-0.03em] text-[#172033] md:text-4xl lg:text-[2.75rem] lg:leading-[1.08]",
  body: "text-base leading-7 text-[#667085]",
  pill: "inline-flex items-center rounded-full border border-[#E7E9EC] bg-[#EDF3F7] px-3.5 py-1.5 text-xs font-medium text-[#183B56]",
  card: "rounded-[1.25rem] border border-[#E7E9EC] bg-white shadow-[0_12px_40px_-24px_rgba(23,32,51,0.28)]",
  cardSoft:
    "rounded-[1.25rem] border border-[#E7E9EC] bg-white/90 shadow-[0_8px_30px_-20px_rgba(23,32,51,0.2)]",
  btnPrimary:
    "inline-flex min-h-11 items-center justify-center rounded-full bg-[#183B56] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#122d43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]",
  btnSecondary:
    "inline-flex min-h-11 items-center justify-center rounded-full border border-[#E7E9EC] bg-white px-6 py-2.5 text-sm font-medium text-[#172033] transition hover:bg-[#EDF3F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]",
  link: "font-medium text-[#183B56] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]",
  accentText: "text-[#3BAF75]",
  accentBg: "bg-[#EAF8F0]",
  scrollAnchor: "scroll-mt-24 md:scroll-mt-28",
} as const;
