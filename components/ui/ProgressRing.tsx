import CircularProgressRing from "@/components/ui/CircularProgressRing";
import { colors } from "@/lib/design-system/tokens";

type ProgressRingProps = {
  value: number;
  label?: string;
  size?: number;
};

export default function ProgressRing({
  value,
  label = "Health",
  size = 180,
}: ProgressRingProps) {
  return (
    <div className="flex flex-col items-center">
      <CircularProgressRing
        value={value}
        size={size}
        progressColor={colors.charcoal}
        trackColor={colors.borderSubtle}
        ariaLabel={`${label}: ${value} percent`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-semibold tracking-tight text-text-primary">
            {value}
          </span>
          <span className="text-sm text-text-tertiary">
            /100
          </span>
        </div>
      </CircularProgressRing>

      <p className="mt-4 text-sm font-medium text-text-secondary">
        {label}
      </p>
    </div>
  );
}
