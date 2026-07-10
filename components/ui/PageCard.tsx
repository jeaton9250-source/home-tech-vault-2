import { ReactNode } from "react";

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PageCard({
  children,
  className = "",
}: PageCardProps) {
  return (
    <section
      className={`rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm md:p-8 ${className}`}
    >
      {children}
    </section>
  );
}