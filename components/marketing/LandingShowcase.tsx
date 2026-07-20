import { Check, ShieldCheck, FileText } from "lucide-react";

const warrantyPoints = [
  "Automatic status for every warranty you track",
  "Clear alerts before coverage expires",
  "Never miss a claim window again",
];

const documentPoints = [
  "Receipts, manuals, and records in one place",
  "Attached to the exact device they belong to",
  "Ready the instant you need to file a claim",
];

export default function LandingShowcase() {
  return (
    <section className="bg-[#111827] px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 md:gap-24">
        {/* Warranty */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
              Warranty Center
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white text-balance md:text-4xl">
              Coverage you can see, protection you can trust.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60 text-pretty">
              Home Tech Vault keeps every warranty organized and surfaces what
              matters most, so you always know what is protected.
            </p>
            <ul className="mt-7 flex flex-col gap-3">
              {warrantyPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-white/80">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C8A96A] text-[#111827]">
                    <Check size={14} />
                  </span>
                  <span className="text-[15px]">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C8A96A] text-[#111827]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  31 active warranties
                </p>
                <p className="text-xs text-white/50">4 expiring in 30 days</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { name: "Samsung OLED TV", status: "Active", pct: "88%" },
                { name: "Sonos Arc", status: "Expiring", pct: "24%" },
                { name: "Dyson V15", status: "Active", pct: "61%" },
              ].map(({ name, status, pct }) => (
                <div
                  key={name}
                  className="rounded-2xl bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#111827]">
                      {name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        status === "Expiring"
                          ? "bg-[#fffbeb] text-[#b45309]"
                          : "bg-[#ecfdf3] text-[#15803d]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[#F3EAD7]">
                    <div
                      className="h-1.5 rounded-full bg-[#C8A96A]"
                      style={{ width: pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="order-2 rounded-3xl border border-white/10 bg-white/5 p-6 md:order-1">
            <div className="grid grid-cols-2 gap-3">
              {[
                "Receipt — MacBook Pro",
                "Manual — Eero Router",
                "Warranty — OLED TV",
                "Invoice — Sonos Arc",
              ].map((doc) => (
                <div
                  key={doc}
                  className="rounded-2xl bg-white p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3EAD7] text-[#C8A96A]">
                    <FileText size={16} />
                  </div>
                  <p className="mt-3 text-[13px] font-semibold leading-5 text-[#111827]">
                    {doc}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B7280]">PDF · Stored</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
              Documents
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white text-balance md:text-4xl">
              Every receipt and manual, right where you need it.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60 text-pretty">
              Attach paperwork directly to the device it belongs to. When it is
              time to make a claim, everything is already in one place.
            </p>
            <ul className="mt-7 flex flex-col gap-3">
              {documentPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-white/80">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C8A96A] text-[#111827]">
                    <Check size={14} />
                  </span>
                  <span className="text-[15px]">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
