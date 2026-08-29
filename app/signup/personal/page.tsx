import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import SignupClient from "./SignupClient";

function SignupLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
      <div className="flex items-center gap-3 text-text-secondary">
        <Loader2
          size={22}
          className="animate-spin"
        />
        Loading Home Tech Vault...
      </div>
    </main>
  );
}

export default function PersonalSignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupClient />
    </Suspense>
  );
}
