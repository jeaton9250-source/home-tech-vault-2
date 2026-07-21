import { ArrowRight } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";

type UpgradeCardProps = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  className?: string;
};

export default function UpgradeCard({
  title,
  description,
  href = "/upgrade",
  actionLabel = "View plans",
  className,
}: UpgradeCardProps) {
  return (
    <div
      className={cn(
        "htv-card htv-card-interactive flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center",
        className
      )}
    >
      <div>
        <p className="text-overline">
          Upgrade available
        </p>

        <h3 className="text-card-title mt-2 text-text-primary">
          {title}
        </h3>

        <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <Button
        href={href}
        variant="premium"
        className="shrink-0"
      >
        {actionLabel}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
