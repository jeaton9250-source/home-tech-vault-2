import {
  BarChart3,
  FileText,
  House,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

const features = [
  {
    icon: Laptop,
    title: "Device Inventory",
    description:
      "Catalog every computer, TV, appliance, and smart-home device with photos, prices, and purchase details.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Center",
    description:
      "See active, expiring, and expired warranties at a glance so a claim window never slips past you.",
  },
  {
    icon: House,
    title: "Home View",
    description:
      "Organize technology room by room and understand exactly what you own, where it lives.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description:
      "Schedule service, log repairs, and keep a complete history for every device you depend on.",
  },
  {
    icon: Radar,
    title: "Network Center",
    description:
      "Keep internet, router, Wi-Fi, and connected-device details in one calm, organized place.",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "Store receipts, manuals, and warranty records securely, ready the moment you need them.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Track technology health, protected value, and inventory insights with clear, useful reporting.",
  },
  {
    icon: Sparkles,
    title: "Premium Tools",
    description:
      "Unlock advanced automation and AI guidance that keeps your entire vault effortlessly up to date.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="bg-[#F7F5EF] px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
            Everything in one vault
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#111827] text-balance md:text-5xl">
            One home for everything you own.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#6B7280] text-pretty">
            Home Tech Vault brings your devices, warranties, documents, and
            maintenance together — so the technology in your life finally feels
            organized.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EAD7] text-[#C8A96A]">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#111827]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
