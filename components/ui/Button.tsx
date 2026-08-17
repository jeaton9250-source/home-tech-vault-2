import Link from "next/link";
import { Loader2 } from "lucide-react";

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/design-system/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "premium"
  | "link";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

type LinkProps =
  SharedProps & {
    href: string;
  } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    | "href"
    | "children"
    | "className"
    | "type"
    | "disabled"
  >;

type RegularButtonProps =
  SharedProps & {
    href?: undefined;
  } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  >;

type ButtonProps =
  | LinkProps
  | RegularButtonProps;

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary:
    "border border-[#718d4f]/45 bg-[#617c43] text-white shadow-[0_12px_28px_-16px_rgba(97,124,67,0.8)] hover:-translate-y-px hover:bg-[#718d4f] hover:shadow-[0_16px_32px_-16px_rgba(97,124,67,0.8)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-[#718d4f]/25",

  secondary:
    "border border-[#182533]/15 bg-[#f8f5ef] text-[#17212a] shadow-sm hover:-translate-y-px hover:border-[#617c43]/25 hover:bg-[#f2eee6] hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:ring-[#617c43]/15",

  ghost:
    "border border-transparent bg-transparent text-[#17212a] hover:bg-[#182533]/5 focus-visible:ring-[#617c43]/10",

  link:
    "border border-transparent bg-transparent p-0 text-[#617c43] hover:text-[#718d4f] focus-visible:ring-[#617c43]/15",

  danger:
    "border border-danger bg-danger text-white shadow-sm hover:opacity-90 hover:shadow-md active:scale-[0.98] focus-visible:ring-danger/25",

  premium:
    "border border-[#b39755]/35 bg-[#a38748] text-white shadow-sm hover:bg-[#92763d] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#a38748]/25",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm:
    "min-h-9 rounded-xl px-3.5 py-2 text-xs",

  md:
    "min-h-11 rounded-xl px-5 py-2.5 text-sm",

  lg:
    "min-h-12 rounded-xl px-6 py-3 text-base",
};

function buildClasses({
  variant,
  size,
  fullWidth,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  className: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium leading-none outline-none transition-all duration-200 ease-[var(--ease-premium)] focus-visible:ring-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    variant !== "link" &&
      sizeClasses[size],
    fullWidth && "w-full",
    className
  );
}

function isLinkProps(
  props: ButtonProps
): props is LinkProps {
  return (
    typeof (props as LinkProps).href ===
    "string"
  );
}

function LoadingIndicator({
  label,
}: {
  label?: string;
}) {
  return (
    <>
      <Loader2
        size={16}
        className="animate-spin"
        aria-hidden
      />

      <span>
        {label ?? "Loading..."}
      </span>
    </>
  );
}

export default function Button(
  props: ButtonProps
) {
  const variant =
    props.variant ?? "primary";

  const size =
    props.size ?? "md";

  const fullWidth =
    props.fullWidth ?? false;

  const loading =
    props.loading ?? false;

  const loadingLabel =
    props.loadingLabel;

  const className =
    props.className ?? "";

  const classes = buildClasses({
    variant,
    size,
    fullWidth,
    className,
  });

  if (isLinkProps(props)) {
    const {
      href,
      children,
      variant: _variant,
      size: _size,
      fullWidth: _fullWidth,
      loading: _loading,
      loadingLabel: _loadingLabel,
      className: _className,
      ...linkProps
    } = props;

    return (
      <Link
        href={href}
        className={classes}
        aria-busy={
          loading || undefined
        }
        {...linkProps}
      >
        {loading ? (
          <LoadingIndicator
            label={loadingLabel}
          />
        ) : (
          children
        )}
      </Link>
    );
  }

  const {
    children,
    type = "button",
    disabled,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    loading: _loading,
    loadingLabel: _loadingLabel,
    className: _className,
    ...buttonProps
  } = props as RegularButtonProps;

  const isDisabled =
    disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={
        loading || undefined
      }
      className={classes}
      {...buttonProps}
    >
      {loading ? (
        <LoadingIndicator
          label={loadingLabel}
        />
      ) : (
        children
      )}
    </button>
  );
}