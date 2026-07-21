import Link from "next/link";

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
};

type LinkProps =
  SharedProps & {
    href: string;
  } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "children" | "className" | "type" | "disabled"
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
    "border border-charcoal bg-charcoal text-surface-card shadow-sm hover:border-charcoal-hover hover:bg-charcoal-hover hover:shadow-md active:scale-[0.98] focus-visible:ring-charcoal/20",

  secondary:
    "border border-border-subtle bg-surface-card text-text-primary shadow-sm hover:border-border-strong hover:bg-surface-hover hover:shadow-md active:scale-[0.98] focus-visible:ring-interaction/15",

  ghost:
    "border border-transparent bg-transparent text-text-primary hover:bg-surface-sunken focus-visible:ring-interaction/10",

  link:
    "border border-transparent bg-transparent p-0 text-interaction hover:text-interaction-hover focus-visible:ring-interaction/15",

  danger:
    "border border-danger bg-danger text-surface-card shadow-sm hover:opacity-90 hover:shadow-md active:scale-[0.98] focus-visible:ring-danger/25",

  premium:
    "border border-premium bg-premium text-surface-card shadow-sm hover:bg-premium-hover hover:shadow-md active:scale-[0.98] focus-visible:ring-premium/25",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm: "min-h-9 rounded-[var(--radius-button)] px-3.5 py-2 text-xs",
  md: "min-h-11 rounded-[var(--radius-button)] px-5 py-2.5 text-sm",
  lg: "min-h-12 rounded-[var(--radius-button)] px-6 py-3 text-base",
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
    variant !== "link" && sizeClasses[size],
    fullWidth && "w-full",
    className
  );
}

function isLinkProps(
  props: ButtonProps
): props is LinkProps {
  return typeof (props as LinkProps).href === "string";
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
      className: _className,
      ...linkProps
    } = props;

    return (
      <Link
        href={href}
        className={classes}
        {...linkProps}
      >
        {children}
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
    className: _className,
    ...buttonProps
  } = props as RegularButtonProps;

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
