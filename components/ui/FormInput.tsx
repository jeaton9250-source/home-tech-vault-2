import { forwardRef, useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import Input from "@/components/ui/Input";
import { cn } from "@/lib/design-system/cn";

type SharedFieldProps = {
  label: string;
  helperText?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

type FormInputProps = SharedFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type FormTextareaProps = SharedFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

type FormInputComponentProps =
  | FormInputProps
  | FormTextareaProps;

const FormInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormInputComponentProps
>(function FormInput(props, ref) {
  const generatedId = useId();
  const {
    label,
    helperText,
    error,
    className,
    inputClassName,
    id = generatedId,
    multiline,
    ...fieldProps
  } = props;

  const helperId = helperText
    ? `${id}-helper`
    : undefined;

  const errorId = error
    ? `${id}-error`
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
        htmlFor={id}
        className="text-label block text-text-primary"
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "htv-input min-h-28 w-full resize-y rounded-[var(--radius-input)] border border-border-subtle bg-surface-card px-4 py-3 text-[0.9375rem] text-text-primary outline-none transition placeholder:text-text-tertiary focus-visible:border-interaction focus-visible:ring-4 focus-visible:ring-interaction/15 disabled:cursor-not-allowed disabled:opacity-60",
            error &&
              "border-danger/40 focus-visible:border-danger focus-visible:ring-danger/15",
            inputClassName
          )}
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          hasError={Boolean(error)}
          className={inputClassName}
          {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

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
});

export default FormInput;

export type {
  FormInputComponentProps,
  FormInputProps,
  FormTextareaProps,
};
