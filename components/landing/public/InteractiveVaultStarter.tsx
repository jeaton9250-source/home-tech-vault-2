"use client";

import { useState } from "react";
import {
  FileText,
  Home,
  Receipt,
  Router,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const options = [
  {
    id: "appliance",
    label: "Appliance",
    icon: Home,
    title: "Kitchen Refrigerator",
    eyebrow: "APPLIANCE RECORD",
    details: [
      ["Brand", "Samsung"],
      ["Model", "RF28..."],
      ["Purchase receipt", "Saved"],
      ["Warranty", "Active"],
      ["Manual", "Ready"],
    ],
    note: "Everything tied to the refrigerator stays with one record.",
  },
  {
    id: "receipt",
    label: "Receipt",
    icon: Receipt,
    title: "Washer Purchase",
    eyebrow: "PURCHASE RECORD",
    details: [
      ["Retailer", "Lowe's"],
      ["Purchase date", "Aug 12"],
      ["Amount", "$849"],
      ["Receipt", "Saved"],
      ["Related item", "Laundry Washer"],
    ],
    note: "No searching through old email when you need proof of purchase.",
  },
  {
    id: "warranty",
    label: "Warranty",
    icon: ShieldCheck,
    title: "HVAC Warranty",
    eyebrow: "WARRANTY RECORD",
    details: [
      ["Provider", "Manufacturer"],
      ["Coverage", "Parts"],
      ["Status", "Active"],
      ["Expiration", "May 2029"],
      ["Document", "Saved"],
    ],
    note: "Coverage details are already there when something needs service.",
  },
  {
    id: "document",
    label: "Home Document",
    icon: FileText,
    title: "Water Heater Manual",
    eyebrow: "HOME DOCUMENT",
    details: [
      ["Category", "Manual"],
      ["Related item", "Water Heater"],
      ["File", "PDF"],
      ["Status", "Saved"],
      ["Location", "My Home"],
    ],
    note: "Important home files stay connected to the things they belong to.",
  },
  {
    id: "wifi",
    label: "Home Wi-Fi",
    icon: Router,
    title: "Home Internet",
    eyebrow: "HOME WI-FI",
    details: [
      ["Provider", "Spectrum"],
      ["Router", "Living Room"],
      ["Network", "Home Wi-Fi"],
      ["Equipment", "Documented"],
      ["Notes", "Saved"],
    ],
    note: "Router and internet details live somewhere easier to find than a notes app.",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: Wrench,
    title: "HVAC Service",
    eyebrow: "MAINTENANCE RECORD",
    details: [
      ["Service", "Seasonal tune-up"],
      ["Completed", "May 18"],
      ["Company", "Saved"],
      ["Receipt", "Attached"],
      ["Next service", "November"],
    ],
    note: "You can see what was done before instead of rebuilding the history later.",
  },
] as const;

export default function InteractiveVaultStarter() {
  const [selectedId, setSelectedId] = useState<(typeof options)[number]["id"]>(
    "appliance"
  );

  const selected =
    options.find((option) => option.id === selectedId) ?? options[0];

  const SelectedIcon = selected.icon;

  return (
    <section className="bg-[#fffdf8] px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[760px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
            Start anywhere
          </p>

          <h2 className="mt-4 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-[#17212a] sm:text-5xl">
            What would you save first?
          </h2>

          <p className="mt-5 max-w-[650px] text-lg leading-8 text-[#68716c]">
            Your vault does not have to start with everything. Pick the kind of
            home information you would want to find quickly later.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {options.map((option) => {
              const Icon = option.icon;
              const active = option.id === selected.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={[
                    "flex w-full items-center gap-4 rounded-[22px] border px-5 py-4 text-left transition",
                    active
                      ? "border-[#617c43] bg-[#edf2e7] shadow-[0_18px_45px_-36px_rgba(55,75,40,0.6)]"
                      : "border-[#ded7ca] bg-[#f5f1e8] hover:border-[#c9c0b0] hover:bg-[#eee8dc]",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      active
                        ? "bg-[#617c43] text-white"
                        : "bg-[#fffdf8] text-[#617c43]",
                    ].join(" ")}
                  >
                    <Icon size={18} aria-hidden />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#17212a]">
                      {option.label}
                    </p>

                    <p className="mt-1 text-xs text-[#7c847f]">
                      See an example record
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-[#17212a]/8 bg-[#f5f1e8] p-5 shadow-[0_30px_80px_-50px_rgba(23,33,42,0.45)] md:p-7">
              <div className="rounded-[24px] bg-[#fffdf8] p-6 ring-1 ring-[#17212a]/6">
                <div className="flex items-start justify-between gap-5 border-b border-[#17212a]/8 pb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
                      {selected.eyebrow}
                    </p>

                    <h3 className="mt-2 font-serif text-3xl text-[#17212a]">
                      {selected.title}
                    </h3>

                    <p className="mt-1 text-sm text-[#7c847f]">
                      Saved to My Home
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
                    <SelectedIcon size={20} aria-hidden />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {selected.details.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-[16px] bg-[#f5f1e8] px-4 py-3.5"
                    >
                      <span className="text-sm text-[#68716c]">{label}</span>

                      <span className="text-sm font-semibold text-[#40502f]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[18px] bg-[#edf2e7] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
                    Why save it?
                  </p>

                  <p className="mt-2 font-serif text-lg leading-7 text-[#40502f]">
                    {selected.note}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-4 hidden rotate-[2deg] rounded-2xl bg-[#183047] px-4 py-3 text-white shadow-lg lg:block">
              <p className="text-sm font-semibold">Click another item</p>
              <p className="mt-1 text-xs text-white/65">
                The vault changes with it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
