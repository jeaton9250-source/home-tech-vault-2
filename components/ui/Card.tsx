import { cn } from "@/lib/design-system/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
};

export default function Card({
  children,
  className = "",
  interactive = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-sm",
        interactive && "htv-card-interactive",
        className
      )}
    >
      {children}
    </div>
  );
}
