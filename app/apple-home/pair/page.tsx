import {
  Suspense,
} from "react";

import {
  Loader2,
} from "lucide-react";

import AppleHomePairingApproval from "@/components/apple-home/AppleHomePairingApproval";

export const dynamic =
  "force-dynamic";

export default function AppleHomePairingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading Apple Home setup…
          </div>
        </main>
      }
    >
      <AppleHomePairingApproval />
    </Suspense>
  );
}
