import { FileUp, Home, Plus, Wrench } from "lucide-react";

const actions = [
  {
    title: "Add device",
    detail: "Track something new",
    icon: Plus,
    className: "bg-[#e4f1e8] text-[#4c8c61]",
  },
  {
    title: "Upload document",
    detail: "Store a manual or receipt",
    icon: FileUp,
    className: "bg-[#e7f1f7] text-[#4d7f9d]",
  },
  {
    title: "Log maintenance",
    detail: "Keep history current",
    icon: Wrench,
    className: "bg-[#fbf0df] text-[#b27a2d]",
  },
  {
    title: "Add room",
    detail: "Organize your space",
    icon: Home,
    className: "bg-[#e5f2eb] text-[#4b8363]",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_14px_40px_rgba(20,36,55,0.045)]">
      <h2 className="font-serif text-[24px] text-[#142437]">
        Quick actions
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="rounded-[18px] border border-[#142437]/[0.05] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${action.className}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#344657]">
                {action.title}
              </p>

              <p className="mt-1 text-[11px] leading-4 text-[#8b969f]">
                {action.detail}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
