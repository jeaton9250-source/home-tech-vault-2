import Link from "next/link";
import {
  LayoutDashboard,
  Laptop,
  CreditCard,
  Wrench,
  ShieldCheck,
  FileText,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/devices", label: "Technology Inventory", icon: Laptop },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/security", label: "Security", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-72 min-h-screen bg-blue-950 text-white p-6">
      <h1 className="text-2xl font-bold">Home Tech Vault™</h1>
      <p className="text-sm text-blue-200 mt-1 mb-8">
        Organize. Protect. Simplify.
      </p>

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
    </aside>
  );
}