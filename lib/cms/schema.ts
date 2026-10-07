import { z } from "zod";
const text = z.string().trim().min(1).max(1000);
export const safeLink = z.string().trim().max(2000).refine(value => /^\/(?!\/|\\)[^\\]*$/.test(value) || (() => { try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } })(), "Use a site path or HTTPS URL.");
export const homepageSchema = z.object({
  eyebrow: text, headline: text, description: text,
  primaryLabel: text, primaryLink: safeLink, secondaryLabel: text, secondaryLink: safeLink,
  heroImage: safeLink, appStoreLink: z.string().url().refine(v => new URL(v).protocol === "https:" && new URL(v).hostname === "apps.apple.com", "Use an Apple App Store link."),
  showAppStore: z.boolean(), announcement: z.string().trim().max(500),
  finalHeadline: text, finalDescription: text,
});
export type HomepageContent = z.infer<typeof homepageSchema>;
export const homepageDefaults: HomepageContent = {
  eyebrow: "Built for the place you call home", headline: "Your home\nhas a memory.",
  description: "Manuals get lost. Receipts disappear. Warranties expire. Service dates get forgotten. Home Tech Vault keeps the useful history of your home together for the years ahead.",
  primaryLabel: "Start Your Home", primaryLink: "/signup", secondaryLabel: "See How It Works", secondaryLink: "/demo",
  heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
  appStoreLink: "https://apps.apple.com/us/app/home-tech-vault/id6812090967", showAppStore: true, announcement: "",
  finalHeadline: "Give your home\na place to remember.", finalDescription: "Manuals, warranties, receipts, maintenance and the history of your home — together at last.",
};
export const articleSchema = z.object({slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100), title: text, description: z.string().trim().min(1).max(300), body: z.string().trim().min(1).max(50000), published: z.boolean()});
export type Article = z.infer<typeof articleSchema>;
