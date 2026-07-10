import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#111827] text-white hover:bg-[#263044] shadow-sm",

  secondary:
    "border border-[#E8E2D6] bg-white text-[#111827] hover:bg-[#F7F5EF]",

  ghost:
    "bg-transparent text-[#111827] hover:bg-[#F7F5EF]",

  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...buttonProps
}: ButtonProps) {
  const classes = `
    inline-flex items-center justify-center gap-2
    rounded-xl px-5 py-3
    text-sm font-semibold
    transition
    disabled:cursor-not-allowed
    disabled:opacity-50
    ${variantClasses[variant]}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

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