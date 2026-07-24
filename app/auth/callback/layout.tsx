import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
          <div className="flex items-center gap-3 text-text-secondary">
            Finishing your invitation setup…
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
