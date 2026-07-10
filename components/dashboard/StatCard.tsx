import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-[28px] border border-[#E8E2D6] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm text-neutral-500">{label}</p>

      <h3 className="mt-2 text-3xl font-semibold text-[#111827]">
        {value}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}