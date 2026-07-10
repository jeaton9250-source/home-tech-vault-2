"use client";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <PageShell>
      <PageTitle
        eyebrow="Digital Home"
        title="Home View"
        description="Organize your technology by room."
        action={<Button href="/devices/add">+ Add Device</Button>}
      />

      <div className="rounded-[32px] border border-[#E8E2D6] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#111827]">
          🚧 Home View is under construction
        </h2>

        <p className="mt-4 text-neutral-600">
          This page will soon organize all of your devices by room, giving you
          a visual map of your home's technology.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-[#F7F5EF] p-6">
            <h3 className="font-bold">🛋 Living Room</h3>
            <p className="mt-2 text-sm text-neutral-500">
              TVs, game consoles, speakers, streaming devices...
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7F5EF] p-6">
            <h3 className="font-bold">💼 Office</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Computers, monitors, printers, networking...
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7F5EF] p-6">
            <h3 className="font-bold">🛏 Bedroom</h3>
            <p className="mt-2 text-sm text-neutral-500">
              TVs, smart speakers, charging stations...
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}