/**
 * Shared styling for the public Home Tech Vault
 * marketing experience.
 */

export const landingTheme = {
  page:
    "htv-public-landing min-h-screen bg-[#0b1623] text-[#f4f0e8] antialiased selection:bg-[#718d4f]/40",

  section:
    "px-5 py-20 md:px-8 md:py-28 lg:px-12",

  sectionNarrow:
    "mx-auto max-w-[1240px]",

  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.16em] text-[#789557]",

  headline:
    "font-serif text-3xl font-medium tracking-[-0.04em] text-[#f4f0e8] md:text-5xl lg:text-[3.4rem] lg:leading-[1.04]",

  body:
    "text-base leading-7 text-[#b9c2ca] md:text-lg md:leading-8",

  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-xs font-semibold tracking-wide text-[#d7dde1] backdrop-blur-md",

  card:
    "rounded-[24px] border border-white/10 bg-[#132231] p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] transition-all duration-300 md:p-8",

  cardSoft:
    "rounded-[24px] border border-white/10 bg-[#172838] p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] transition-all duration-300 md:p-8",

  btnPrimary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8ba866]/40 bg-[#617c43] px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#718d4f] hover:scale-[1.01] active:scale-[0.98]",

  btnSecondary:
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 bg-white/[0.02] px-7 py-3 text-sm font-semibold text-[#f4f0e8] transition-all duration-200 hover:bg-white/10 hover:scale-[1.01] active:scale-[0.98]",

  link:
    "font-semibold text-[#88a761] underline-offset-4 hover:underline hover:text-[#a2bd7e]",

  accentText:
    "text-[#88a761]",

  accentBg:
    "bg-[#718d4f]/10",

  scrollAnchor:
    "scroll-mt-24 md:scroll-mt-28",
} as const;