"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Plus,
  X,
  Laptop,
  FileText,
  Shield,
  CreditCard,
  Wifi,
  KeyRound,
  StickyNote,
} from "lucide-react";

const items = [
  { href: "/devices", label: "Device", icon: Laptop },
  { href: "/documents", label: "Document", icon: FileText },
  { href: "/warranties", label: "Warranty", icon: Shield },
  { href: "/subscriptions", label: "Subscription", icon: CreditCard },
  { href: "/network", label: "Network", icon: Wifi },
  { href: "/security", label: "Password", icon: KeyRound },
  { href: "/notes", label: "Note", icon: StickyNote },
];

export default function AddNewItemModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-2 rounded-2xl bg-[#C8A96A] px-5 py-3 text-sm font-semibold text-[#111827] transition hover:opacity-90"
      >
        <Plus size={18} />
        Add New Item
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">
                  What would you like to add?
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Choose a category to continue.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 transition hover:border-[#C8A96A] hover:bg-[#FDFBF6]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F3EA] text-[#111827]">
                      <Icon size={21} />
                    </div>

                    <span className="font-medium text-[#111827]">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}