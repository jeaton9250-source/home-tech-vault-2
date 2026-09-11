import {
  Bath,
  BedDouble,
  CalendarDays,
  Maximize2,
} from "lucide-react";

const details = [
  { icon: Maximize2, label: "2,428 sq ft" },
  { icon: BedDouble, label: "4 bedrooms" },
  { icon: Bath, label: "3 bathrooms" },
  { icon: CalendarDays, label: "Built 2019" },
];

export default function HomeOverview() {
  return (
    <section className="rounded-[26px] bg-white p-6 shadow-[0_15px_45px_rgba(20,36,55,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[25px] tracking-[-0.03em] text-[#142437]">
          Home at a glance
        </h2>

        <button
          type="button"
          className="text-xs font-medium text-[#617688] hover:text-[#142437]"
        >
          View profile →
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-[1.05fr_0.95fr] sm:items-center">
        <div
          className="relative min-h-[180px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#e4ebe7] to-[#d3ddd8] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/dashboard/home-small.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#142437]/10 via-transparent to-white/10" />

          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#536677] shadow-sm backdrop-blur">
            Home profile
          </span>
        </div>

        <div className="space-y-3">
          {details.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-[12px] px-1 py-1 text-sm text-[#5f707e]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f4f2]">
                <Icon className="h-3.5 w-3.5 text-[#657c71]" />
              </span>

              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[17px] bg-[#f2f4f0] px-5 py-4 text-center">
        <p className="font-serif text-sm italic text-[#78877e]">
          “A well-cared-for home creates a well-lived life.”
        </p>
      </div>
    </section>
  );
}
