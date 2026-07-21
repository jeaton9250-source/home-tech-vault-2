import { cn } from "@/lib/design-system/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AuthFormFieldProps = {
  label: string;
  htmlFor: string;
  icon?: LucideIcon;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export default function AuthFormField({
  label,
  htmlFor,
  icon: Icon,
  hint,
  children,
  className,
}: AuthFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-medium text-text-primary"
      >
        {Icon ? (
          <Icon
            size={16}
            className="text-interaction"
            aria-hidden
          />
        ) : null}
        {label}
      </label>

      {hint ? (
        <p
          id={`${htmlFor}-hint`}
          className="text-xs leading-5 text-text-muted"
        >
          {hint}
        </p>
      ) : null}

      {children}
    </div>
  );
}
