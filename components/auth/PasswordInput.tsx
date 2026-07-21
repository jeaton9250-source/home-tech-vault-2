"use client";

import { authInputClassName } from "@/components/auth/authStyles";
import { cn } from "@/lib/design-system/cn";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  required?: boolean;
  describedBy?: string;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  showPassword,
  onToggleVisibility,
  required = false,
  describedBy,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-describedby={describedBy}
        className={cn(
          authInputClassName,
          "pr-12"
        )}
      />

      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
        className="absolute right-3 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-text-tertiary transition hover:bg-surface-sunken hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
      >
        {showPassword ? (
          <EyeOff size={18} aria-hidden />
        ) : (
          <Eye size={18} aria-hidden />
        )}
      </button>
    </div>
  );
}
