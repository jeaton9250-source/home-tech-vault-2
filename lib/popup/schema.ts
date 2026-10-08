import { z } from "zod";
import { isPublicMarketingPath } from "@/lib/marketing/routes";
export const popupSettingsSchema = z.object({
  enabled:z.boolean(),campaign:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  headline:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(1000),
  buttonText:z.string().trim().min(1).max(80),successMessage:z.string().trim().min(1).max(500),
  delaySeconds:z.number().int().min(0).max(120),
  pages:z.array(z.string().trim().refine(path=>/^\/[a-z0-9/-]*$/.test(path)&&isPublicMarketingPath(path),"Choose a public marketing page.")).min(1).max(30),
  showName:z.boolean(),showPhone:z.boolean(),showMessage:z.boolean(),askMarketingConsent:z.boolean(),
  consentText:z.string().trim().min(1).max(500),
});
export type PopupSettings=z.infer<typeof popupSettingsSchema>;
export const popupDefaults:PopupSettings={enabled:false,campaign:"home-tech-vault-interest",headline:"Keep in touch with Home Tech Vault",description:"Leave your details and let us know how we can help you organize your home.",buttonText:"Send my details",successMessage:"Thanks! Your details have been received.",delaySeconds:8,pages:["/"],showName:true,showPhone:false,showMessage:true,askMarketingConsent:true,consentText:"I would like to receive Home Tech Vault news and offers by email. I can unsubscribe at any time."};
export const submissionSchema=z.object({
  email:z.string().trim().email().max(254).transform(value=>value.toLowerCase()),
  name:z.string().trim().max(120).default(""),phone:z.string().trim().max(40).default(""),message:z.string().trim().max(3000).default(""),
  marketingConsent:z.boolean().default(false),campaign:z.string().max(80),revision:z.string().max(100),page:z.string().max(300),
  website:z.string().max(300).default(""),
});
export function popupMatchesPage(settings:Pick<PopupSettings,"pages">,path:string){return isPublicMarketingPath(path)&&settings.pages.some(page=>page==="/" ? path==="/" : path===page||path.startsWith(`${page}/`));}
export function csvCell(value:unknown){const text=String(value??"");const safe=/^[\s]*[=+\-@]/.test(text)||/^[\t\r]/.test(text) ? `'${text}` : text;return `"${safe.replace(/"/g,'""')}"`;}
