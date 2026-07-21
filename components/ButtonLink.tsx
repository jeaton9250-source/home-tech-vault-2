import Link from "next/link";

import { cn } from "@/lib/design-system/cn";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const styles = {
    primary:
      "border border-charcoal bg-charcoal text-surface-card hover:-translate-y-px hover:border-charcoal-hover hover:bg-charcoal-hover hover:shadow-md focus-visible:ring-4 focus-visible:ring-interaction/20",
    secondary:
      "border border-border-subtle bg-surface-card text-text-primary hover:bg-surface-hover focus-visible:ring-4 focus-visible:ring-interaction/15",
    danger:
      "border border-danger bg-danger text-surface-card hover:opacity-90 focus-visible:ring-4 focus-visible:ring-danger/25",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-[var(--ease-premium)] focus-visible:outline-none active:scale-[0.98]",
        styles[variant]
      )}
    >
      {children}
    </Link>
  );
}