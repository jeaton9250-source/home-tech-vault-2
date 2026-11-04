import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({
  children,
  className = "",
}: PageShellProps) {
  return (
    <div className="min-h-[calc(100vh-var(--topbar-height))] w-full bg-[#f5f1e8]">
      <div
        className={[
          "mx-auto min-h-[calc(100vh-var(--topbar-height))]",
          "w-full max-w-[1460px]",
          "bg-[#eee9df]",
          "px-4 pb-20 pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pt-12",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default PageShell;