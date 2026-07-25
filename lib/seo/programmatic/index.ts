export { SEO_BRANDS, getSeoBrand, brandsByCategory } from "@/lib/seo/programmatic/brands";
export type { SeoBrand, BrandCategory } from "@/lib/seo/programmatic/brands";

export {
  GUIDE_INTENTS,
  brandMatchesIntent,
  primaryProductForIntent,
} from "@/lib/seo/programmatic/intents";
export type {
  GuideIntent,
  GuideIntentId,
} from "@/lib/seo/programmatic/intents";

export {
  getAllProgrammaticGuides,
  getProgrammaticGuide,
  getProgrammaticGuidesByBrand,
  getRelatedProgrammaticGuides,
  listProgrammaticGuideStaticParams,
  programmaticGuideSitemapEntries,
} from "@/lib/seo/programmatic/compose";
export type {
  ProgrammaticGuidePage,
  ProgrammaticFaq,
  ProgrammaticSection,
  ProgrammaticRelatedLink,
} from "@/lib/seo/programmatic/compose";
