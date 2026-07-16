import Link from "next/link";

import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

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
    "border border-[#111827] bg-[#111827] text-white shadow-sm hover:bg-[#263044] hover:shadow-md focus-visible:ring-[#111827]/20",

  secondary:
    "border border-[#E8E2D6] bg-white text-[#111827] shadow-sm hover:border-[#D8C69D] hover:bg-[#FCFAF6] hover:shadow-md focus-visible:ring-[#C8A96A]/20",

  ghost:
    "border border-transparent bg-transparent text-[#111827] hover:bg-[#F7F5EF] focus-visible:ring-[#111827]/10",

  danger:
    "border border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-600/20",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm: "min-h-9 rounded-xl px-3.5 py-2 text-xs",
  md: "min-h-11 rounded-2xl px-5 py-2.5 text-sm",
  lg: "min-h-13 rounded-2xl px-6 py-3.5 text-base",
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
  return [
    "inline-flex items-center justify-center gap-2",
    "font-semibold leading-none",
    "outline-none",
    "transition-all duration-200",
    "focus-visible:ring-4",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonPropsWithoutTypeAndDisabled =
  SharedProps & {
    href?: undefined;
  } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  >;

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