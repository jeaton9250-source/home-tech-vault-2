import { FileText, Home, Package, Wrench } from "lucide-react";

const activity = [
  {
    title: "Document uploaded",
    detail: "Kitchen appliance manual",
    time: "2h",
    icon: FileText,
  },
  {
    title: "Maintenance logged",
    detail: "Replaced HVAC filter",
    time: "1d",
    icon: Wrench,
  },
  {
    title: "New device added",
    detail: "Nest Thermostat",
    time: "2d",
    icon: Package,
  },
  {
    title: "Room updated",
    detail: "Kitchen details added",
    time: "3d",
    icon: Home,
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(20,36,55,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[24px] text-[#142437]">
          Recent activity
        </h2>

        <button className="text-xs font-medium text-[#607588]">
          View all →
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {activity.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4f6] text-[#55778c]">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#334555]">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#8a959f]">
                  {item.detail}
                </p>
              </div>

              <span className="text-[11px] text-[#a0a9b0]">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
