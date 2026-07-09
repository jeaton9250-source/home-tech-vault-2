"use client";

import Link from "next/link";
import React from "react";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) {
  const styles: Record<string, string> = {
    primary: "bg-blue-950 text-white hover:bg-blue-900",
    secondary: "bg-white text-blue-950 border hover:bg-gray-50",
    ghost: "bg-transparent text-blue-950 border-transparent hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const classes = `inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}