import { SitePage } from "@/components/marketing/RedesignSitePage";
import { createPageMetadata } from "@/lib/marketing/metadata";
import { MarketingText } from "@/components/marketing/MarketingContent";

export const metadata = createPageMetadata({
  title: "Centriq Alternative — Free Home Device & Warranty Record",
  description: "Looking for a Centriq replacement? Keep devices, manuals, receipts, warranties and service history together with Home Tech Vault, on web and iPhone. Free to start.",
  path: "/compare/centriq-alternative",
  keywords: ["centriq alternative", "centriq replacement app", "centriq export data", "apps like centriq"],
});
const scope = "app/compare/centriq-alternative/page.tsx";
const fields = [
  ["Item name or description", "Device name", "Use a recognizable name, such as Kitchen refrigerator."],
  ["Manufacturer or brand", "Brand", "Keep the manufacturer separate from the model."],
  ["Model number", "Model number", "Copy exactly, including letters, hyphens and leading zeros."],
  ["Serial number", "Serial number", "Keep it as text so spreadsheet software does not alter it."],
  ["Room or location", "Room / location", "Group equipment where you use it."],
  ["Purchase date", "Purchase date", "Check the date against your receipt."],
  ["Notes", "Device notes", "Keep installation and service details you can verify."],
] as const;
const capabilities = [
  ["Appliances and home equipment", "Keep models, serial numbers, purchase dates and rooms together."],
  ["Manuals and proof of purchase", "Attach saved manuals, receipts and warranty documents to their devices."],
  ["Warranty and service records", "Record coverage dates and maintenance history; capabilities depend on plan."],
  ["Household access", "Household adds shared access with member roles."],
  ["Centriq migration", "No dedicated Centriq CSV importer. Use your export as a reference and add the records manually."],
  ["Old attachments and missing data", "HTV cannot recover documents or data from Centriq. Upload copies you already saved."],
  ["Parts, filters and recall services", "Do not assume Centriq's parts matching or recall services carry over. Check the manufacturer for these details."],
] as const;
export default function CentriqAlternativePage() {
  return <SitePage eyebrow="A NEW HOME FOR YOUR RECORDS" title="Looking for a Centriq alternative?" intro="Your home's record is worth keeping. Home Tech Vault gives appliances, manuals, receipts, warranties and service history a place to stay — on the web and on iPhone.">
    <div className="mt-8 flex flex-wrap gap-3"><a href="/signup" className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white">Start your free record</a><a href="https://apps.apple.com/us/app/home-tech-vault/id6812090967" className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold">Download on the App Store</a></div>
    <section className="mt-20"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>If you have your Centriq export</MarketingText></h2><ol className="mt-6 list-decimal space-y-4 pl-6 leading-7 text-[#536174]"><li>Keep an untouched backup of the export and any attachments you saved separately.</li><li>Open a working copy and start with your five most important appliances. Use the field guide below to add each device in HTV.</li><li>Attach your saved manuals, receipts and photos, then check purchase dates and warranty coverage against the original documents.</li></ol><p className="mt-6 leading-7 text-[#536174]">This is a manual transfer guide, not an automatic import template. Export headings can vary; match the meaning of each field. A spreadsheet does not necessarily contain the files linked from it.</p><div className="mt-8 overflow-x-auto rounded-2xl border border-[#d8d5cc]"><table className="w-full min-w-[640px] text-left text-sm"><caption className="bg-[#e8e4d9] p-4 text-left font-semibold">Export information → HTV device fields</caption><thead className="bg-[#faf8f3]"><tr>{["Information in your export", "Where to put it in HTV", "What to check"].map(h => <th key={h} scope="col" className="p-4">{h}</th>)}</tr></thead><tbody>{fields.map(row => <tr key={row[0]} className="border-t border-[#d8d5cc]">{row.map(cell => <td key={cell} className="p-4 align-top text-[#536174]">{cell}</td>)}</tr>)}</tbody></table></div></section>
    <section className="mt-20 rounded-2xl bg-[#18283b] p-8 text-[#f5f2eb] md:p-12"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>No export? Start with five appliances.</MarketingText></h2><p className="mt-6 max-w-3xl leading-8 text-white/75">Photograph the model and serial plates on your refrigerator, dishwasher, washer, water heater and HVAC system where they are safely accessible. Add each device, then look for receipts in your email and purchase history. Find manuals on the manufacturer's website using the exact model number. Leave unknown dates blank rather than guessing.</p><p className="mt-5 text-white/75">Start with one device today. A small, accurate record is already useful.</p></section>
    <section className="mt-20"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>What Home Tech Vault can replace today</MarketingText></h2><p className="mt-5 leading-7 text-[#536174]">If you liked having the paperwork beside each appliance in Centriq, that is the job HTV focuses on. It is not a drop-in replacement for every Centriq service.</p><div className="mt-8 overflow-x-auto rounded-2xl border border-[#d8d5cc]"><table className="w-full min-w-[480px] text-left text-sm"><thead className="bg-[#e8e4d9]"><tr><th scope="col" className="p-4">Need</th><th scope="col" className="p-4">HTV today</th></tr></thead><tbody>{capabilities.map(([need, answer]) => <tr key={need} className="border-t border-[#d8d5cc]"><th scope="row" className="p-4 align-top font-medium">{need}</th><td className="p-4 leading-6 text-[#536174]">{answer}</td></tr>)}</tbody></table></div></section>
    <section className="mt-20"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>Choose around the records you need.</MarketingText></h2><p className="mt-5 leading-7 text-[#536174]">Home is $0 forever, with up to 8 devices and 25 documents. Home Plus is $7.99/month for expanded tools and unlimited devices and documents. Household is $14.99/month and adds shared household access. <a href="/pricing" className="underline">Compare the plans</a>.</p><p className="mt-5 leading-7 text-[#536174]">Also compare <a href="/compare/home-tech-vault-vs-homezada" className="underline">HomeZada</a> and <a href="/compare/home-tech-vault-vs-sortly" className="underline">Sortly</a> if your needs extend beyond the home record. Review each product's current features, export options and pricing before choosing.</p></section>
    <section className="mt-20 rounded-2xl bg-[#e8e4d9] p-8 md:p-12"><h2 className="font-serif text-4xl"><MarketingText scope={scope}>Start with one device.</MarketingText></h2><p className="mt-5 text-[#536174]">Free to start. No credit card. Your account works on web and iPhone.</p><div className="mt-7 flex flex-wrap gap-4"><a href="/signup" className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white">Start your free record</a><a href="/demo" className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold">See how it works</a></div></section>
  </SitePage>;
}
