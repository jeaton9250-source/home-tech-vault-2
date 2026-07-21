import {
  Cloud,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Users,
} from "lucide-react";

const indicators = [
  { icon: Cloud, label: "Secure Cloud Storage" },
  { icon: Lock, label: "Encrypted" },
  { icon: Users, label: "Family Sharing" },
  { icon: MonitorSmartphone, label: "Cross-device Access" },
  { icon: ShieldCheck, label: "Role-based Access" },
] as const;

type TrustIndicatorsProps = {
  className?: string;
  title?: string;
};

export default function TrustIndicators({
  className = "",
  title,
}: TrustIndicatorsProps) {
  return (
    <div className={className}>
      {title && (
        <p className="text-overline text-text-muted">
          {title}
        </p>
      )}

      <ul
        className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-4 ${
          title ? "mt-10" : ""
        }`}
        aria-label="Trust indicators"
      >
        {indicators.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary"
          >
            <Icon
              size={16}
              className="text-home-health"
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrustBadgeGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm text-text-secondary"
        >
          <Icon
            size={15}
            className="shrink-0 text-home-health"
            aria-hidden
          />
          {label}
        </div>
      ))}
    </div>
  );
}
