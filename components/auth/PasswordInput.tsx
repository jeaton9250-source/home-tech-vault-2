"use client";

import { useId } from "react";
import { Eye, EyeOff } from "lucide-react";

import Input from "@/components/ui/Input";
import { cn } from "@/lib/design-system/cn";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  id?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  showPassword,
  onToggleVisibility,
  id,
  placeholder,
  helperText,
  error,
  required = false,
  className,
}: PasswordInputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const helperId = helperText
    ? `${fieldId}-helper`
    : undefined;

  const errorId = error
    ? `${fieldId}-error`
    : undefined;

  const describedBy = [
    helperId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="text-label block text-text-primary"
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={fieldId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          hasError={Boolean(error)}
          className="pr-12"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-2 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-[var(--radius-button)] text-text-tertiary transition hover:bg-surface-sunken hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </button>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-danger"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="text-caption"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
