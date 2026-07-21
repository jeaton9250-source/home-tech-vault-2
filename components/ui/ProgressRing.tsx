import CircularProgressRing from "@/components/ui/CircularProgressRing";

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
        progressColor="#111827"
        trackColor="#E5E7EB"
        ariaLabel={`${label}: ${value} percent`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-semibold tracking-tight text-neutral-950">
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
