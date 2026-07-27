import { Check } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_SECURITY_POINTS } from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function SecuritySection() {
  return (
    <section className="bg-[#EDF3F7]/45 px-5 py-16 md:px-8 md:py-24 lg:px-10">
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className={landingTheme.eyebrow}>
              Security
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              Built for private household access.
            </h2>
            <p className={cn(landingTheme.body, "mt-4")}>
              Secure sign-in and household permissions keep your
              home profile private to you and the people you
              invite.
            </p>
          </div>

          <ul className="space-y-4">
            {LANDING_SECURITY_POINTS.map((point) => (
              <li
                key={point}
                className={cn(
                  landingTheme.cardSoft,
                  "flex items-start gap-3 p-5"
                )}
              >
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-[#3BAF75]"
                  aria-hidden
                />
                <span className="text-sm leading-7 text-[#667085]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
