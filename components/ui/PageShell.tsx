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
    <div className="min-h-[calc(100vh-var(--topbar-height))] w-full bg-[#eee9df]">
      <div
        className={[
          "mx-auto min-h-[calc(100vh-var(--topbar-height))]",
          "w-full max-w-[var(--content-max)]",
          "bg-[#eee9df]",
          "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default PageShell;