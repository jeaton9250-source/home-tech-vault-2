import { FileWarning, ShieldAlert, Wrench } from "lucide-react";

const items = [
  {
    title: "2 warranties expiring soon",
    detail: "Ring Doorbell · LG Refrigerator",
    icon: ShieldAlert,
    iconClass: "bg-[#fbecec] text-[#c15d67]",
  },
  {
    title: "1 maintenance task due",
    detail: "HVAC filter replacement · 7 days",
    icon: Wrench,
    iconClass: "bg-[#fbf1df] text-[#b57b25]",
  },
  {
    title: "3 missing documents",
    detail: "Add manuals for 3 devices",
    icon: FileWarning,
    iconClass: "bg-[#eaf2f7] text-[#4e7b9b]",
  },
];

export default function AttentionCard() {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(20,36,55,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[24px] text-[#142437]">
          What needs attention
        </h2>

        <button className="text-xs font-medium text-[#607588]">
          View all →
        </button>
      </div>

      <div className="mt-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex w-full items-center gap-4 border-b border-[#142437]/[0.06] py-4 text-left last:border-b-0"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${item.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#27394a]">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-xs text-[#88949e]">
                  {item.detail}
                </p>
              </div>

              <span className="text-[#a1aab1]">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
