"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileText,
  Laptop,
  Plus,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore, type Device } from "@/lib/calculateTechnologyScore";

import PageShell from "@/components/ui/PageShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SmartAlertCard from "@/components/SmartAlertCard";
import HealthBreakdown from "@/components/HealthBreakdown";

function isWithinDays(dateString?: string | null, days = 30) {
  if (!dateString) return false;

  const today = new Date();
  const target = new Date(dateString);

  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= days;
}

export default function Home() {
  type SubscriptionRow = {
    id: string;
      service_name: string;
    monthly_cost?: number | null;
    renewal_date?: string | null;
  };

  type DocumentRow = { id: string };

  const [isDemo, setIsDemo] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsDemo(true);
        return;
      }

      setIsDemo(false);

      const { data: deviceData } = await supabase.from("devices").select("*");
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*");
      const { data: documentData } = await supabase
        .from("documents")
        .select("*");

      setDevices(deviceData || []);
      setSubscriptions(subscriptionData || []);
      setDocuments(documentData || []);
    }

    loadDashboard();
  }, []);

  const deviceCount = isDemo ? 14 : devices.length;
  const documentCount = isDemo ? 31 : documents.length;
  const subscriptionCount = isDemo ? 9 : subscriptions.length;

  const technologyScore = isDemo ? 94 : calculateTechnologyScore(devices);

  const monthlySpend = isDemo
    ? 84.97
    : subscriptions.reduce(
        (sum, sub) => sum + Number(sub.monthly_cost || 0),
        0
      );

  const totalDeviceValue = isDemo
    ? 12846
    : devices.reduce(
        (sum, device) => sum + Number(device.purchase_price || 0),
        0
      );

  const warrantiesExpiring = isDemo
    ? [{ id: "demo-1" }]
    : devices.filter((device) => isWithinDays(device.warranty_date, 30));

  const renewalsComing = isDemo
    ? [{ id: "demo-1" }]
    : subscriptions.filter((sub) => isWithinDays(sub.renewal_date, 30));

  const missingWarranty = isDemo
    ? 2
    : devices.filter((device) => !device.warranty_date).length;

  const missingSerials = isDemo
    ? 1
    : devices.filter((device) => !device.serial_number).length;

  const vaultQuality = Math.max(
    0,
    100 -
      (warrantiesExpiring.length +
        renewalsComing.length +
        missingWarranty +
        missingSerials) *
        5
  );

  return (
    <PageShell>
      <AnimatedSection>
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-[#E8E2D6] bg-gradient-to-br from-white via-white to-[#F2E8D0] p-8 shadow-[0_18px_60px_rgba(17,24,39,0.07)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#111827] p-3 text-white">
                <Sparkles size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A96A]">
                  {isDemo ? "Interactive Demo" : "Home Tech Vault"}
                </p>
                <p className="text-sm text-neutral-500">
                  Organize • Protect • Simplify
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-[#111827]">
              {isDemo
                ? "Your digital home, beautifully organized."
                : "Your digital home is in focus."}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              Track devices, documents, warranties, subscriptions, and your home
              network in one polished command center.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={isDemo ? "/login" : "/devices/add"}>
                <Plus size={16} className="mr-2" />
                {isDemo ? "Create Your Vault" : "Add Device"}
              </Button>

              <Button href="/audit" variant="secondary">
                View Audit <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <HeroMetric title="Protected Value" value={`$${totalDeviceValue.toFixed(0)}`} />
              <HeroMetric title="Monthly Spend" value={`$${monthlySpend.toFixed(2)}`} />
              <HeroMetric title="Vault Quality" value={`${vaultQuality}%`} />
            </div>
          </div>

          <Card className="p-8">
            <div className="flex flex-col items-center">
              <ProgressRing
                value={technologyScore}
                label={
                  technologyScore >= 90
                    ? "Excellent"
                    : technologyScore >= 75
                    ? "Good"
                    : "Needs attention"
                }
              />
            </div>

            <div className="mt-8">
              <HealthBreakdown
                security={92}
                organization={technologyScore}
                maintenance={84}
                documentation={Math.max(0, 100 - missingWarranty * 10)}
                network={88}
              />
            </div>
          </Card>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <MiniStat title="Devices" value={String(deviceCount)} />
          <MiniStat title="Documents" value={String(documentCount)} />
          <MiniStat title="Subscriptions" value={String(subscriptionCount)} />
          <MiniStat title="Tech Value" value={`$${totalDeviceValue.toFixed(0)}`} />
        </section>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card className="p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A96A]">
                  Today&apos;s Brief
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#111827]">
                  Mission Control
                </h2>
              </div>

              <div className="rounded-2xl bg-[#F2E8D0] p-3 text-[#111827]">
                <Activity size={22} />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <SmartAlertCard
                tone={warrantiesExpiring.length > 0 ? "warning" : "success"}
                title={
                  warrantiesExpiring.length > 0
                    ? `${warrantiesExpiring.length} Warranty Alert`
                    : "Warranties Look Good"
                }
                description={
                  warrantiesExpiring.length > 0
                    ? "Review warranties expiring within the next 30 days."
                    : "No warranties need attention right now."
                }
              />

              <SmartAlertCard
                tone={renewalsComing.length > 0 ? "warning" : "success"}
                title={
                  renewalsComing.length > 0
                    ? `${renewalsComing.length} Subscription Renewal`
                    : "Subscriptions Look Good"
                }
                description={
                  renewalsComing.length > 0
                    ? "Review upcoming renewals before they charge."
                    : "No subscriptions renew within the next 30 days."
                }
              />

              <SmartAlertCard
                tone={missingWarranty > 0 ? "warning" : "success"}
                title={
                  missingWarranty > 0
                    ? `${missingWarranty} Missing Warranty Records`
                    : "Warranty Records Complete"
                }
                description={
                  missingWarranty > 0
                    ? "Add warranty dates to improve your vault quality."
                    : "Every tracked device has warranty information."
                }
              />

              <SmartAlertCard
                tone={missingSerials > 0 ? "info" : "success"}
                title={
                  missingSerials > 0
                    ? `${missingSerials} Missing Serial Number`
                    : "Inventory Complete"
                }
                description={
                  missingSerials > 0
                    ? "Serial numbers help with insurance, warranties, and support."
                    : "Every device has a serial number recorded."
                }
              />
            </div>
          </Card>

          <Card className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A96A]">
              Quick Actions
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
              Keep your vault current.
            </h2>

            <div className="mt-6 grid gap-3">
              <QuickAction
                href="/devices/add"
                icon={<Laptop size={20} />}
                title="Add Device"
                description="Track a new computer, phone, router, or smart device."
              />

              <QuickAction
                href="/documents/upload"
                icon={<FileText size={20} />}
                title="Upload Document"
                description="Save receipts, warranties, manuals, and invoices."
              />

              <QuickAction
                href="/subscriptions/add"
                icon={<Plus size={20} />}
                title="Add Subscription"
                description="Track recurring digital services and renewals."
              />

              <QuickAction
                href="/audit"
                icon={<ShieldCheck size={20} />}
                title="Technology Audit"
                description="Generate a professional overview of your vault."
              />
            </div>
          </Card>
        </section>
      </AnimatedSection>
    </PageShell>
  );
}

function HeroMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E8E2D6] bg-white/70 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
    </Card>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 rounded-3xl border border-[#E8E2D6] bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-[#F2E8D0]"
    >
      <div className="rounded-2xl bg-[#111827] p-3 text-white">{icon}</div>

      <div>
        <h3 className="font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      </div>
    </a>
  );
}