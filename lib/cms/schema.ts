import { z } from "zod";
const text = z.string().trim().min(1).max(1000);
import { safeLink } from "./links";
import { pageOverridesSchema } from "./pageContent";
export { safeLink } from "./links";
export const homepageSchema = z.object({
  eyebrow: text,
  headline: text,
  description: text,
  primaryLabel: text,
  primaryLink: safeLink,
  secondaryLabel: text,
  secondaryLink: safeLink,
  heroImage: safeLink,
  appStoreLink: z
    .string()
    .url()
    .refine(
      (v) =>
        new URL(v).protocol === "https:" &&
        new URL(v).hostname === "apps.apple.com",
      "Use an Apple App Store link.",
    ),
  showAppStore: z.boolean(),
  announcement: z.string().trim().max(500),
  finalHeadline: text,
  finalDescription: text,
  pages: pageOverridesSchema.default({}),
});
export type HomepageContent = z.infer<typeof homepageSchema>;
export const homepageDefaults: HomepageContent = {
  pages: {},
  eyebrow: "A smarter way to care for your home",
  headline: "Your home.\nAll in one place.",
  description:
    "Keep your devices, manuals, receipts, warranties, and maintenance history together—ready whenever you need them.",
  primaryLabel: "Start your home vault",
  primaryLink: "/signup",
  secondaryLabel: "See How It Works",
  secondaryLink: "/demo",
  heroImage:
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
  appStoreLink: "https://apps.apple.com/us/app/home-tech-vault/id6812090967",
  showAppStore: true,
  announcement: "",
  finalHeadline: "Your home,\nin sync.",
  finalDescription:
    "Start building a living record of the place you call home.",
};
export const articleSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  title: text,
  description: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(50000),
  published: z.boolean(),
});
export type Article = z.infer<typeof articleSchema>;
