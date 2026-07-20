import {
  BarChart3,
  FileText,
  House,
  Laptop,
  Radar,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

/*
  A CSS-built representation of the real Home Tech Vault
  dashboard. It intentionally mirrors the app's layout,
  color tokens, and iconography so the landing page shows
  an authentic picture of the product without shipping a
  screenshot or generated artwork.
*/

const navItems = [
  { icon: House, label: "Dashboard", active: true },
  { icon: Laptop, label: "Devices" },
  { icon: ShieldCheck, label: "Warranties" },
  { icon: Wrench, label: "Maintenance" },
  { icon: Radar, label: "Network" },
  { icon: FileText, label: "Documents" },
  { icon: BarChart3, label: "Reports" },
];

const stats = [
  { label: "Devices tracked", value: "48", tone: "ink" },
  { label: "Protected value", value: "$32,480", tone: "gold" },
  { label: "Active warranties", value: "31", tone: "green" },
  { label: "Expiring soon", value: "4", tone: "amber" },
];

const devices = [
  { name: "Samsung OLED TV", room: "Living Room", status: "Protected" },
  { name: 'MacBook Pro 16"', room: "Office", status: "Protected" },
  { name: "Sonos Arc", room: "Living Room", status: "Expiring" },
  { name: "Eero 6 Router", room: "Utility", status: "Protected" },
];

export default function VaultMockup() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#E8E2D6] bg-white shadow-2xl shadow-black/10">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D6] bg-[#FBFAF7] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#E8E2D6]" />
        <span className="h-3 w-3 rounded-full bg-[#E8E2D6]" />
        <span className="h-3 w-3 rounded-full bg-[#E8E2D6]" />
        <div className="ml-4 h-5 w-56 rounded-md bg-[#F3EAD7]" />
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-[#E8E2D6] bg-[#111827] p-4 sm:block">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8A96A] text-[#111827]">
              <ShieldCheck size={18} />
            </div>
            <span className="text-sm font-bold text-white">Vault</span>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${
                  active
                    ? "bg-white/10 font-semibold text-white"
                    : "text-white/55"
                }`}
              >
                <Icon size={15} />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1 bg-[#F7F5EF] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Good morning
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#111827]">
                Your Home Vault
              </h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E2D6] bg-white text-[#6B7280]">
              <Settings size={16} />
            </div>
          </div>

          {/* stat cards */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ label, value, tone }) => (
              <div
                key={label}
                className="rounded-xl border border-[#E8E2D6] bg-white p-3"
              >
                <p className="text-[11px] leading-4 text-[#6B7280]">
                  {label}
                </p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    tone === "gold"
                      ? "text-[#C8A96A]"
                      : tone === "green"
                        ? "text-[#15803d]"
                        : tone === "amber"
                          ? "text-[#b45309]"
                          : "text-[#111827]"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* device list */}
          <div className="mt-3 rounded-xl border border-[#E8E2D6] bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#111827]">
                Recent devices
              </p>
              <span className="text-[11px] font-medium text-[#C8A96A]">
                View all
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {devices.map(({ name, room, status }) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg bg-[#FBFAF7] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3EAD7] text-[#C8A96A]">
                      <Laptop size={15} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">
                        {name}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">{room}</p>
                    </div>
                  </div>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
