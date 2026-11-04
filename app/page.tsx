import { loadHomepage } from "@/lib/cms/server";
import JuicyInspiredLanding from "@/components/landing/JuicyInspiredLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await loadHomepage();

  return (
    <>
      {content.announcement ? (
        <div role="status" className="bg-[#142438] px-5 py-3 text-center text-xs text-white">
          {content.announcement}
        </div>
      ) : null}
      <JuicyInspiredLanding />
    </>
  );
}
