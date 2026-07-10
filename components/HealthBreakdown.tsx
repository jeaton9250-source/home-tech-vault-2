"use client";

type HealthBreakdownProps = {
  security: number;
  organization: number;
  maintenance: number;
  documentation: number;
  network: number;
};

const items = [
  { label: "Security", key: "security" as const },
  { label: "Organization", key: "organization" as const },
  { label: "Maintenance", key: "maintenance" as const },
  { label: "Documentation", key: "documentation" as const },
  { label: "Network", key: "network" as const },
];

export default function HealthBreakdown({
  security,
  organization,
  maintenance,
  documentation,
  network,
}: HealthBreakdownProps) {
  const values = {
    security,
    organization,
    maintenance,
    documentation,
    network,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-neutral-500">{item.label}</p>
          <p className="mt-3 text-4xl font-semibold text-neutral-950">
            {values[item.key]}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-2 rounded-full bg-blue-950 transition-all duration-300"
              style={{ width: `${values[item.key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
