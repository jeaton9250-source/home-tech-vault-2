import { cn } from "@/lib/design-system/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
};

export default function Card({
  children,
  className = "",
  interactive = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)]",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#617c43]/25 hover:shadow-[0_24px_55px_-36px_rgba(15,25,35,0.5)]",
        className
      )}
    >
      {children}
    </div>
  );
}