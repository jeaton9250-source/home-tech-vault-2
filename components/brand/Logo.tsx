import { cn } from "@/lib/design-system/cn";

type LogoProps = {
  collapsed?: boolean;
  className?: string;
};

export default function Logo({
  collapsed = false,
  className,
}: LogoProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "truncate font-semibold uppercase tracking-[0.12em] text-text-primary",
          collapsed
            ? "text-[0.8125rem]"
            : "text-sm md:text-[0.9375rem]"
        )}
      >
        Home Tech Vault
      </p>
    </div>
  );
}
