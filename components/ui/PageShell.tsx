import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({
  children,
  className = "",
}: PageShellProps) {
  return (
    <main
      className={`min-h-screen space-y-8 bg-[#F7F5EF] text-[#111827] ${className}`}
    >
      {children}
    </main>
  );
}