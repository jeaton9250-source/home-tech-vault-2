/**
 * Shared styling for the public Home Tech Vault
 * marketing experience.
 */

export const landingTheme = {
  page:
    "htv-public-landing min-h-screen bg-[#f5f1e8] text-[#17212a] antialiased selection:bg-[#617c43]/25",

  section:
    "px-5 py-20 md:px-8 md:py-28 lg:px-12",

  sectionNarrow:
    "mx-auto max-w-[1240px]",

  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.16em] text-[#617c43]",

  headline:
    "font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] md:text-5xl lg:text-[3.4rem] lg:leading-[1.04]",

  body:
    "text-base leading-7 text-[#68716c] md:text-lg md:leading-8",

  pill:
    "inline-flex items-center gap-2 rounded-full border border-[#17212a]/10 bg-[#fffdf8]/80 px-4 py-2 text-xs font-semibold tracking-wide text-[#59625d] backdrop-blur-md",

  card:
    "rounded-[24px] border border-[#17212a]/10 bg-[#fffdf8] p-6 shadow-[0_20px_60px_-40px_rgba(23,33,42,0.22)] transition-all duration-300 md:p-8",

  cardSoft:
    "rounded-[24px] border border-[#17212a]/10 bg-[#e7dfd0] p-6 shadow-[0_20px_60px_-40px_rgba(23,33,42,0.18)] transition-all duration-300 md:p-8",

  btnPrimary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-[#617c43]/30 bg-[#617c43] px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#718d4f] hover:scale-[1.01] active:scale-[0.98]",

  btnSecondary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-[#17212a]/15 bg-[#fffdf8]/70 px-7 py-3 text-sm font-semibold text-[#17212a] transition-all duration-200 hover:bg-[#fffdf8] hover:scale-[1.01] active:scale-[0.98]",

  link:
    "font-semibold text-[#617c43] underline-offset-4 hover:underline hover:text-[#40502f]",

  accentText:
    "text-[#617c43]",

  accentBg:
    "bg-[#617c43]/10",

  scrollAnchor:
    "scroll-mt-24 md:scroll-mt-28",
} as const;