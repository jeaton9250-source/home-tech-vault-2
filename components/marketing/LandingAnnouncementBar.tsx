import { LANDING_ANNOUNCEMENT } from "@/lib/marketing/landingNav";

export default function LandingAnnouncementBar() {
  return (
    <div className="border-b border-border-subtle/70 bg-surface-sunken/60">
      <p className="mx-auto max-w-6xl px-8 py-2.5 text-center text-xs leading-5 text-text-muted lg:px-10">
        {LANDING_ANNOUNCEMENT}
      </p>
    </div>
  );
}
