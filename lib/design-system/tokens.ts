export const colors = {
  /** Warm stone app background */
  surfaceBase: "#FAF9F7",
  /** Floating ivory card surfaces */
  surfaceCard: "#FDFCFA",
  /** Inset wells, inputs, icon containers */
  surfaceSunken: "#F3F1EC",
  surfaceHover: "#F7F5F0",

  textPrimary: "#1C1917",
  textSecondary: "#44403C",
  textMuted: "#78716C",
  textTertiary: "#A8A29E",

  borderSubtle: "#E7E2DA",
  borderStrong: "#D6D0C4",

  /** Charcoal — primary actions (buttons, key CTAs) */
  charcoal: "#111827",
  charcoalHover: "#1F2937",
  charcoalSoft: "#374151",

  /** Interaction blue — links, focus, progress, selected controls only */
  interaction: "#4A6FA5",
  interactionHover: "#3D5D8C",
  interactionSoft: "#E8EEF4",

  /** Royal plum — premium badges, insights identity */
  premium: "#4A3561",
  premiumHover: "#3D2D52",
  premiumSoft: "#F3EEF8",

  /** Home Health emerald — signature brand centerpiece */
  homeHealth: "#1F5C45",
  homeHealthHover: "#184A38",
  homeHealthSoft: "#ECF6F0",
  homeHealthMuted: "#C5DDD3",

  success: "#1F5C45",
  successSoft: "#ECF6F0",

  warning: "#9A6B2F",
  warningSoft: "#F9F3E8",

  danger: "#B4534B",
  dangerSoft: "#FAEFEE",

  achievement: "#9A6B2F",
  achievementSoft: "#F9F3E8",
} as const;

export const sections = {
  technology: {
    accent: "#2C3E5C",
    soft: "#EEF1F6",
  },
  digitalVault: {
    accent: "#3D3566",
    soft: "#F0EEF8",
  },
  network: {
    accent: "#1F4D52",
    soft: "#ECF5F4",
  },
  homeHealth: {
    accent: "#1F5C45",
    soft: "#ECF6F0",
  },
  insights: {
    accent: "#4A3561",
    soft: "#F3EEF8",
  },
  warning: {
    accent: "#9A6B2F",
    soft: "#F9F3E8",
  },
} as const;

export const radius = {
  card: "24px",
  button: "12px",
  input: "12px",
  dialog: "20px",
  chip: "9999px",
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const typography = {
  hero: { size: "48px", maxSize: "56px", weight: 500 },
  pageTitle: { size: "32px", weight: 500 },
  sectionTitle: { size: "24px", weight: 500 },
  cardTitle: { size: "18px", weight: 500 },
  body: { size: "16px", weight: 400 },
  label: { size: "14px", weight: 500 },
} as const;

export const shadows = {
  sm: "0 1px 2px rgb(28 25 23 / 0.05)",
  md: "0 4px 20px rgb(28 25 23 / 0.07)",
  lg: "0 12px 44px rgb(28 25 23 / 0.09)",
  lift: "0 20px 56px rgb(28 25 23 / 0.1)",
  inset: "inset 0 1px 0 rgb(255 255 255 / 0.75)",
  well: "inset 0 2px 4px rgb(28 25 23 / 0.04)",
} as const;

export const motion = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  durationFast: "160ms",
  durationNormal: "220ms",
} as const;

export const brand = {
  name: "Home Tech Vault",
  tagline: "Organize Your Home Technology",
  taglineLines: ["Organize Your", "Home Technology"],
  identity:
    "The digital home for everything that powers your home.",
  greeting: "Welcome home",
  commandCenter: "Home Command Center",
  homePulse: "Home Pulse",
} as const;

/** @deprecated Use `interaction` for links/focus. Kept for gradual migration. */
export const colorsLegacy = {
  accent: colors.interaction,
  accentHover: colors.interactionHover,
  accentSoft: colors.interactionSoft,
};
