import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const styles = {
    primary: "bg-charcoal text-surface-card hover:bg-charcoal-hover",
    secondary: "bg-white text-text-primary border hover:bg-surface-sunken",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}