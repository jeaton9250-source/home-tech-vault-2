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
    primary: "bg-blue-950 text-white hover:bg-blue-900",
    secondary: "bg-white text-blue-950 border hover:bg-gray-50",
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