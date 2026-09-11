import {
  FileText,
  Home,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const stats = [
  {
    title: "Devices",
    value: "24",
    detail: "2 added this month",
    icon: Package,
    iconClass: "bg-[#e7f3f7] text-[#37708d]",
  },
  {
    title: "Documents",
    value: "18",
    detail: "3 need attention",
    icon: FileText,
    iconClass: "bg-[#eaf4eb] text-[#4f7b59]",
  },
  {
    title: "Warranties",
    value: "12",
    detail: "2 expiring soon",
    icon: ShieldCheck,
    iconClass: "bg-[#f6eded] text-[#aa6060]",
  },
  {
    title: "Maintenance",
    value: "7",
    detail: "1 due soon",
    icon: Wrench,
    iconClass: "bg-[#fbf0dc] text-[#a8792e]",
  },
  {
    title: "Rooms",
    value: "8",
    detail: "All rooms added",
    icon: Home,
    iconClass: "bg-[#e8f2f8] text-[#527a98]",
  },
];

export default function DashboardStats() {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-[22px] border border-[#142437]/[0.05] bg-white p-5 shadow-[0_12px_35px_rgba(20,36,55,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(20,36,55,0.06)]"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${stat.iconClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <span className="text-lg text-[#a0a9b0]">›</span>
            </div>

            <p className="mt-6 text-sm font-medium text-[#425262]">
              {stat.title}
            </p>

            <div className="mt-1 flex items-end gap-3">
              <p className="font-serif text-[36px] leading-none text-[#142437]">
                {stat.value}
              </p>

              <p className="pb-1 text-[11px] text-[#89949e]">
                {stat.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
