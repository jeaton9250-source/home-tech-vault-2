import Link from "next/link";
import {
  Bot,
  FilePlus2,
  Laptop,
  Plus,
} from "lucide-react";

const actions = [
  {
    href: "/devices/add",
    label: "Add Device",
    description: "Add new technology",
    icon: Plus,
  },
  {
    href: "/devices",
    label: "My Devices",
    description: "View your inventory",
    icon: Laptop,
  },
  {
    href: "/documents",
    label: "Documents",
    description: "Open your digital binder",
    icon: FilePlus2,
  },
  {
    href: "/ai",
    label: "Ask AI",
    description: "Get technology help",
    icon: Bot,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#111827]">
        Quick Actions
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl bg-[#F7F5EF] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-sm">
              <Icon size={20} />
            </div>

            <p className="mt-4 font-semibold text-[#111827]">
              {label}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}