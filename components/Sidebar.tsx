import Link from "next/link";
import {
  LayoutDashboard,
  Laptop,
  FileText,
  Wifi,
  ShieldCheck,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/devices", label: "Inventory", icon: Laptop },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/network", label: "Network", icon: Wifi },
    { href: "/security", label: "Security", icon: ShieldCheck },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-72 min-h-screen bg-blue-950 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Home Tech Vault™</h1>
        <p className="text-sm text-blue-200 mt-1">
          Organize. Protect. Simplify.
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-blue-900 transition"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl bg-blue-900 p-4">
        <p className="text-sm font-semibold">Vault Status</p>
        <p className="text-xs text-blue-200 mt-1">
          Your home technology system is being built.
        </p>
      </div>
    </aside>
  );
}