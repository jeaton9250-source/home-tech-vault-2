import { cn } from "@/lib/design-system/cn";
import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { ReactNode } from "react";

type AuthAlertProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

export default function AuthAlert({
  variant,
  children,
  className,
}: AuthAlertProps) {
  const isError = variant === "error";

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-6",
        isError
          ? "border-danger/25 bg-danger-soft text-danger"
          : "border-home-health/25 bg-home-health-soft text-home-health",
        className
      )}
    >
      {isError ? (
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0"
          aria-hidden
        />
      ) : (
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0"
          aria-hidden
        />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
