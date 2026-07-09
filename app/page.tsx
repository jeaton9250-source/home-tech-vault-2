"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import { ArrowRight } from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import LuxuryHero from "@/components/ui/LuxuryHero";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SmartAlertCard from "@/components/SmartAlertCard";

function isWithinDays(dateString?: string, days = 30) {
  if (!dateString) return false;

  const today = new Date();
  const target = new Date(dateString);

  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= days;
}

export default function Home() {
  const [isDemo, setIsDemo] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

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
      const { data: subscriptionData } = await supabase.from("subscriptions").select("*");
      const { data: documentData } = await supabase.from("documents").select("*");

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
    : subscriptions.reduce((sum, sub) => sum + Number(sub.monthly_cost || 0), 0);

  const totalDeviceValue = isDemo
    ? 12846
    : devices.reduce((sum, device) => sum + Number(device.purchase_price || 0), 0);

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

  return (
    <PageShell>
      <LuxuryHero
        eyebrow={isDemo ? "Interactive Demo" : "Mission Control"}
        title={
          isDemo
            ? "Everything about your home technology."
            : "Your digital home is organized."
        }
        description={
          isDemo
            ? "Track devices, documents, warranties, subscriptions, and your home network in one calm, secure place."
            : "A clean snapshot of your devices, documents, warranties, subscriptions, and home network."
        }
        score={technologyScore}
        action={
          <div className="flex flex-wrap gap-3">
            <Button href={isDemo ? "/login" : "/devices/add"} variant="secondary">
              {isDemo ? "Create Your Vault" : "Add Device"}
            </Button>

            <Button href="/audit" variant="ghost">
              View Audit <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        }
      />

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <MiniStat title="Devices" value={String(deviceCount)} />
        <MiniStat title="Documents" value={String(documentCount)} />
        <MiniStat title="Subscriptions" value={String(subscriptionCount)} />
        <MiniStat title="Technology Value" value={`$${totalDeviceValue.toFixed(2)}`} />
      </section>

      <section className="mt-12">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Needs Attention
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Mission Control
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
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
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Button href="/devices/add">Add Device</Button>
        <Button href="/documents/upload" variant="secondary">
          Upload Document
        </Button>
        <Button href="/subscriptions/add" variant="secondary">
          Add Subscription
        </Button>
        <Button href="/audit" variant="ghost">
          Technology Audit
        </Button>
      </section>
    </PageShell>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-6">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
        {value}
      </p>
    </Card>
  );
}