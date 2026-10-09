import { SitePage } from "@/components/marketing/RedesignSitePage";
import { MarketingImg, MarketingText } from "@/components/marketing/MarketingContent";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata = createPageMetadata({
  title: "For Realtors & Builders — A Home Record at Closing",
  description: "Give buyers a useful home record at closing. Keep appliances, manuals, warranties and service details together with Home Tech Vault.",
  path: "/for-realtors",
});
const scope = "app/for-realtors/page.tsx";
const benefits = [
  ["What the buyer gets", "A place for appliances and home systems, model numbers, manuals, receipts, warranty dates and service history. Gather the records available at closing so the buyer has a useful starting point."],
  ["What you get", "A practical closing gift and a reason to follow up with something useful: the HVAC service record, an appliance manual or the details the buyer needs to maintain their new home."],
  ["What it takes from you", "Create a partner account, prepare a home gift and add the information you have permission to share. When it is ready, send the ownership invitation so the buyer can claim their home record."],
] as const;
export default function RealtorsPage() {
  return <SitePage eyebrow="FOR REALTORS & BUILDERS" title="Give every home you sell a memory." intro="Hand your buyers a record they can keep using after the boxes are unpacked. The useful details of their home, together from the start." visual={<MarketingImg scope={scope} src="/images/home-hero.jpg" alt="Modern home surrounded by trees and landscaping" width={1200} height={900} className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]" fetchPriority="high" />}>
    <div className="mt-8 flex flex-wrap gap-3">
      <a href="mailto:support@hometechvault.com?subject=Home%20handoff%20for%20my%20next%20closing" className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white"><MarketingText scope={scope}>Request a handoff for your next closing</MarketingText></a>
      <a href="/realtors/signup" className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold"><MarketingText scope={scope}>Create a partner account</MarketingText></a>
    </div>
    <section className="mt-20 grid gap-6 lg:grid-cols-3">
      {benefits.map(([title, body]) => <article key={title} className="rounded-2xl border border-[#d8d5cc] bg-[#faf8f3] p-8"><h2 className="font-serif text-3xl"><MarketingText scope={scope}>{title}</MarketingText></h2><p className="mt-5 leading-7 text-[#536174]"><MarketingText scope={scope}>{body}</MarketingText></p></article>)}
    </section>
    <section className="mt-20 rounded-2xl bg-[#18283b] p-8 text-[#f5f2eb] md:p-12">
      <p className="text-xs uppercase tracking-[0.24em] text-[#c6c16a]"><MarketingText scope={scope}>A HOME RECORD AT CLOSING</MarketingText></p>
      <h2 className="mt-5 max-w-3xl font-serif text-4xl md:text-5xl"><MarketingText scope={scope}>The closing folder, with somewhere to live.</MarketingText></h2>
      <ul className="mt-8 grid gap-4 text-white/80 sm:grid-cols-2">{["Appliance models and serial numbers", "Manuals, receipts and warranty documents", "Maintenance dates and service providers", "Home system notes and useful photos"].map(item => <li key={item}><MarketingText scope={scope}>{item}</MarketingText></li>)}</ul>
      <p className="mt-8 max-w-2xl leading-7 text-white/70"><MarketingText scope={scope}>Share only the records intended for the buyer. Review documents and remove personal account information before sending the home record.</MarketingText></p>
    </section>
    <section className="mt-20 max-w-3xl"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>A home's history shouldn't reset at closing.</MarketingText></h2><p className="mt-6 text-lg leading-8 text-[#536174]"><MarketingText scope={scope}>The water heater replacement. The roof repair. The last service visit. Give those details a place to stay, so the next owner has a starting point and your work at closing stays useful.</MarketingText></p><a href="/demo" className="mt-6 inline-block underline underline-offset-4">Explore the demo</a></section>
    <section className="mt-20 rounded-2xl bg-[#e8e4d9] p-8 md:p-12"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>Start with your next closing.</MarketingText></h2><p className="mt-5 max-w-2xl leading-7 text-[#536174]"><MarketingText scope={scope}>Tell us about the home and the records you have. We'll walk through the handoff with you and discuss preparation, timing and the right gift option.</MarketingText></p><a href="mailto:support@hometechvault.com?subject=Home%20Tech%20Vault%20partner%20one-pager" className="mt-7 inline-block rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white">Request the partner overview</a><p className="mt-4 text-sm text-[#536174]">Prefer to begin yourself? <a href="/realtors/signup" className="underline">Create your partner account</a>.</p></section>
  </SitePage>;
}
