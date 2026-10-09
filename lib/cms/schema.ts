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
  eyebrow: "Your home, remembered",
  headline: "Your home\nhas a memory.",
  description:
    "Manuals get lost. Receipts disappear. Warranties expire. Service dates get forgotten. Home Tech Vault keeps the useful history of your home together for the years ahead.",
  primaryLabel: "Start your home vault",
  primaryLink: "/signup",
  secondaryLabel: "See How It Works",
  secondaryLink: "/demo",
  heroImage: "/images/home-tech-vault-hero.png",
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
