import {
  ArrowRight,
  Camera,
  Router,
  Snowflake,
  UtensilsCrossed,
} from "lucide-react";

const spaces = [
  {
    name: "Kitchen",
    detail: "6 devices",
    secondary: "2 documents",
    icon: UtensilsCrossed,
    image: "/images/rooms/kitchen.jpg",
    fallback: "from-[#eee8dc] to-[#d8d1c3]",
  },
  {
    name: "HVAC",
    detail: "3 devices",
    secondary: "1 warranty",
    icon: Snowflake,
    image: "/images/rooms/hvac.jpg",
    fallback: "from-[#dce7e5] to-[#c9d7d3]",
  },
  {
    name: "Network",
    detail: "4 devices",
    secondary: "All good",
    icon: Router,
    image: "/images/rooms/network.jpg",
    fallback: "from-[#e4e8e5] to-[#d2d8d4]",
  },
  {
    name: "Security",
    detail: "3 devices",
    secondary: "1 warranty",
    icon: Camera,
    image: "/images/rooms/security.jpg",
    fallback: "from-[#e9e7e3] to-[#d8d4cf]",
  },
];

export default function SpacesAndSystems() {
  return (
    <div className="rounded-[25px] bg-white p-6 shadow-[0_15px_45px_rgba(20,36,55,0.045)]">
      <div className="flex items-center justify-between gap-5">
        <h2 className="font-serif text-[24px] tracking-[-0.025em] text-[#142437]">
          Your spaces &amp; systems
        </h2>

        <button
          type="button"
          className="text-xs font-medium text-[#607588] transition hover:text-[#142437]"
        >
          View all rooms →
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {spaces.map((space) => {
          const Icon = space.icon;

          return (
            <button
              key={space.name}
              type="button"
              className="group overflow-hidden rounded-[21px] bg-[#fafaf8] text-left shadow-[inset_0_0_0_1px_rgba(20,36,55,0.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,36,55,0.10)]"
            >
              {/* PHOTO / GRADIENT FALLBACK */}
              <div
                className={`relative h-[122px] bg-gradient-to-br bg-cover bg-center ${space.fallback}`}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(20,36,55,0.01), rgba(20,36,55,0.12)), url('${space.image}')`,
                }}
              >
                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/88 shadow-sm backdrop-blur">
                  <Icon
                    className="h-4 w-4 text-[#536d6b]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-serif text-[21px] tracking-[-0.025em] text-[#263849]">
                    {space.name}
                  </p>

                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#89959e] transition duration-200 group-hover:translate-x-1" />
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[11px] text-[#71808c]">
                    {space.detail}
                  </p>

                  <p className="text-[11px] text-[#9aa3aa]">
                    {space.secondary}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
