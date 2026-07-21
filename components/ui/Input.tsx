import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/design-system/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, hasError = false, ...props },
    ref
  ) {
    return (
      <input
        ref={ref}
        className={cn(
          "htv-input w-full min-h-12 rounded-[var(--radius-input)] border border-border-subtle bg-surface-card px-4 py-3 text-[0.9375rem] text-text-primary outline-none transition placeholder:text-text-tertiary focus-visible:border-interaction focus-visible:ring-4 focus-visible:ring-interaction/15 disabled:cursor-not-allowed disabled:opacity-60",
          hasError &&
            "border-danger/40 focus-visible:border-danger focus-visible:ring-danger/15",
          className
        )}
        {...props}
      />
    );
  }
);

export default Input;
