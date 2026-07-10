"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Laptop,
  Loader2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

import DashboardHero from "@/components/dashboard/DashboardHero";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentDevices, {
  type RecentDevice,
} from "@/components/dashboard/RecentDevices";
import WarrantyAlerts, {
  type WarrantyDevice,
} from "@/components/dashboard/WarrantyAlerts";
import TechnologyScoreCard from "@/components/dashboard/TechnologyScoreCard";

import {
  calculateVaultScore,
  type VaultDevice,
  type VaultScoreResult,
} from "@/lib/calculateVaultScore";

import {
  demoDashboard,
  demoDevices,
} from "@/lib/demoData";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  location: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  notes?: string | null;
};

type ImageRow = {
  device_id: string;
  image_url: string;
};

type DocumentRow = {
  device_id: string;
};

type MaintenanceRow = {
  device_id: string;
};

const defaultVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

export default function DashboardPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [firstName, setFirstName] =
    useState("Homeowner");

  const [householdName, setHouseholdName] =
    useState("My Home Tech Vault");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [
    activeWarrantyCount,
    setActiveWarrantyCount,
  ] = useState(0);

  const [protectedValue, setProtectedValue] =
    useState(0);

  const [vaultScore, setVaultScore] =
    useState<VaultScoreResult>(
      defaultVaultScore
    );

  const [recentDevices, setRecentDevices] =
    useState<RecentDevice[]>([]);

  const [warrantyAlerts, setWarrantyAlerts] =
    useState<WarrantyDevice[]>([]);

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingDashboard(true);
        setErrorMessage("");

        if (isDemo || !user) {
          loadDemoDashboard();
          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("full_name, household_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Unable to load profile:",
            profileError
          );
        }

        const displayName =
          profile?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Homeowner";

        setFirstName(
          displayName.split(" ")[0]
        );

        setHouseholdName(
          profile?.household_name?.trim() ||
            `${displayName.split(" ")[0]}'s Home Tech Vault`
        );

        const {
          data: devices,
          error: devicesError,
        } = await supabase
          .from("devices")
          .select(
            `
              id,
              device_name,
              brand,
              location,
              category,
              serial_number,
              purchase_date,
              purchase_price,
              warranty_date,
              notes
            `
          )
          .eq("user_id", user.id);

        if (devicesError) {
          throw devicesError;
        }

        const deviceRows =
          (devices || []) as DeviceRow[];

        setDeviceCount(deviceRows.length);

        setProtectedValue(
          deviceRows.reduce(
            (total, device) =>
              total +
              Number(
                device.purchase_price || 0
              ),
            0
          )
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeWarranties =
          deviceRows.filter((device) => {
            if (!device.warranty_date) {
              return false;
            }

            const expiration = new Date(
              `${device.warranty_date}T23:59:59`
            );

            return expiration >= today;
          });

        setActiveWarrantyCount(
          activeWarranties.length
        );

        const expiringSoon = deviceRows
          .filter((device) =>
            Boolean(device.warranty_date)
          )
          .map((device) => {
            const expiration = new Date(
              `${device.warranty_date}T23:59:59`
            );

            const daysRemaining = Math.ceil(
              (expiration.getTime() -
                today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return {
              id: device.id,
              device_name:
                device.device_name ||
                "Unnamed Device",
              warranty_date:
                device.warranty_date,
              days_remaining:
                daysRemaining,
            };
          })
          .filter(
            (device) =>
              device.days_remaining >= 0 &&
              device.days_remaining <= 60
          )
          .sort(
            (first, second) =>
              first.days_remaining -
              second.days_remaining
          )
          .slice(0, 4);

        setWarrantyAlerts(
          expiringSoon as WarrantyDevice[]
        );

        const {
          data: documentRows,
          count: documents,
          error: documentsError,
        } = await supabase
          .from("device_documents")
          .select("device_id", {
            count: "exact",
          })
          .eq("user_id", user.id);

        if (documentsError) {
          console.error(
            "Unable to load documents:",
            documentsError
          );
        }

        const resolvedDocumentCount =
          documents || 0;

        setDocumentCount(
          resolvedDocumentCount
        );

        const {
          data: maintenanceRows,
          error: maintenanceError,
        } = await supabase
          .from("device_events")
          .select("device_id")
          .eq("user_id", user.id)
          .in("event_type", [
            "Maintenance",
            "Repair",
            "Cleaning",
            "Software Update",
          ]);

        if (maintenanceError) {
          console.error(
            "Unable to load maintenance records:",
            maintenanceError
          );
        }

        const latestDevices = [
          ...deviceRows,
        ]
          .reverse()
          .slice(0, 6);

        const firstImageByDevice =
          new Map<string, string>();

        const deviceIdsWithPhotos =
          new Set<string>();

        if (deviceRows.length > 0) {
          const allDeviceIds =
            deviceRows.map(
              (device) => device.id
            );

          const {
            data: imageRows,
            error: imageError,
          } = await supabase
            .from("device_images")
            .select(
              "device_id, image_url"
            )
            .eq("user_id", user.id)
            .in("device_id", allDeviceIds)
            .order("created_at", {
              ascending: true,
            });

          if (imageError) {
            console.error(
              "Unable to load device images:",
              imageError
            );
          }

          for (const image of (imageRows ||
            []) as ImageRow[]) {
            deviceIdsWithPhotos.add(
              image.device_id
            );

            if (
              !firstImageByDevice.has(
                image.device_id
              )
            ) {
              firstImageByDevice.set(
                image.device_id,
                image.image_url
              );
            }
          }
        }

        if (latestDevices.length === 0) {
          setRecentDevices([]);
        } else {
          const devicesWithPhotos =
            await Promise.all(
              latestDevices.map(
                async (device) => {
                  const imagePath =
                    firstImageByDevice.get(
                      device.id
                    );

                  if (!imagePath) {
                    return {
                      id: device.id,
                      device_name:
                        device.device_name ||
                        "Unnamed Device",
                      brand:
                        device.brand || "",
                      location:
                        device.location || "",
                      photo_url: "",
                    };
                  }

                  const {
                    data: signedData,
                    error: signedUrlError,
                  } =
                    await supabase.storage
                      .from(
                        "device-images"
                      )
                      .createSignedUrl(
                        imagePath,
                        3600
                      );

                  if (signedUrlError) {
                    console.error(
                      "Unable to create signed device image:",
                      signedUrlError
                    );
                  }

                  return {
                    id: device.id,
                    device_name:
                      device.device_name ||
                      "Unnamed Device",
                    brand:
                      device.brand || "",
                    location:
                      device.location || "",
                    photo_url:
                      signedData?.signedUrl ||
                      "",
                  };
                }
              )
            );

          setRecentDevices(
            devicesWithPhotos
          );
        }

        const vaultDevices: VaultDevice[] =
          deviceRows.map((device) => ({
            id: device.id,
            device_name:
              device.device_name || "",
            brand: device.brand || "",
            category:
              device.category || "",
            serial_number:
              device.serial_number || "",
            purchase_date:
              device.purchase_date || "",
            warranty_date:
              device.warranty_date || "",
            purchase_price:
              device.purchase_price || 0,
            location:
              device.location || "",
            notes:
              device.notes || "",
          }));

        const deviceIdsWithDocuments =
          new Set(
            (
              (documentRows ||
                []) as DocumentRow[]
            ).map(
              (document) =>
                document.device_id
            )
          );

        const deviceIdsWithMaintenance =
          new Set(
            (
              (maintenanceRows ||
                []) as MaintenanceRow[]
            ).map(
              (maintenance) =>
                maintenance.device_id
            )
          );

        try {
          const calculatedScore =
            calculateVaultScore({
              devices: vaultDevices,
              deviceIdsWithPhotos,
              deviceIdsWithDocuments,
              deviceIdsWithMaintenance,
            });

          setVaultScore(
            calculatedScore
          );
        } catch (scoreError) {
          console.error(
            "Unable to calculate vault score:",
            scoreError
          );

          setVaultScore(
            defaultVaultScore
          );
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoadingDashboard(false);
      }
    }

    function loadDemoDashboard() {
      setFirstName(
        demoDashboard.firstName
      );

      setHouseholdName(
        demoDashboard.householdName
      );

      setDeviceCount(
        demoDashboard.deviceCount
      );

      setDocumentCount(
        demoDashboard.documentCount
      );

      setActiveWarrantyCount(
        demoDashboard.activeWarrantyCount
      );

      setProtectedValue(
        demoDashboard.protectedValue
      );

      const demoRecentDevices: RecentDevice[] =
        demoDevices
          .slice(0, 6)
          .map((device) => ({
            id: device.id,
            device_name:
              device.device_name,
            brand:
              device.brand,
            location:
              device.location,
            photo_url:
              device.photo_url || "",
          }));

      setRecentDevices(
        demoRecentDevices
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const demoWarrantyAlerts =
        demoDevices
          .filter((device) =>
            Boolean(
              device.warranty_date
            )
          )
          .map((device) => {
            const expiration =
              new Date(
                `${device.warranty_date}T23:59:59`
              );

            const daysRemaining =
              Math.ceil(
                (expiration.getTime() -
                  today.getTime()) /
                  (1000 *
                    60 *
                    60 *
                    24)
              );

            return {
              id: device.id,
              device_name:
                device.device_name,
              warranty_date:
                device.warranty_date,
              days_remaining:
                daysRemaining,
            };
          })
          .filter(
            (device) =>
              device.days_remaining >= 0 &&
              device.days_remaining <= 365
          )
          .sort(
            (first, second) =>
              first.days_remaining -
              second.days_remaining
          )
          .slice(0, 4);

      setWarrantyAlerts(
        demoWarrantyAlerts as WarrantyDevice[]
      );

      const demoVaultDevices: VaultDevice[] =
        demoDevices.map((device) => ({
          id: device.id,
          device_name:
            device.device_name,
          brand:
            device.brand,
          category:
            device.category,
          serial_number:
            device.serial_number,
          purchase_date:
            device.purchase_date,
          warranty_date:
            device.warranty_date,
          purchase_price:
            device.purchase_price,
          location:
            device.location,
          notes:
            device.notes,
        }));

      try {
        const calculatedDemoScore =
          calculateVaultScore({
            devices:
              demoVaultDevices,

            deviceIdsWithPhotos:
              new Set([
                "demo-macbook",
                "demo-tv",
                "demo-xbox",
                "demo-iphone",
              ]),

            deviceIdsWithDocuments:
              new Set([
                "demo-macbook",
                "demo-tv",
                "demo-router",
              ]),

            deviceIdsWithMaintenance:
              new Set([
                "demo-macbook",
                "demo-printer",
                "demo-router",
              ]),
          });

        setVaultScore(
          calculatedDemoScore
        );
      } catch (scoreError) {
        console.error(
          "Unable to calculate demo vault score:",
          scoreError
        );

        setVaultScore({
          total: 92,
          protection: 94,
          organization: 96,
          documentation: 88,
          maintenance: 90,
          label: "Excellent",
          recommendations: [
            "Upload the missing printer receipt.",
            "Complete the upcoming router firmware update.",
          ],
        });
      }
    }

    loadDashboard();
  }, [user, isDemo, demoLoading]);

  const loading =
    demoLoading ||
    loadingDashboard;

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2
            className="animate-spin"
            size={22}
          />

          Loading your vault...
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="p-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-bold">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-5 md:p-8">
      <DashboardHero
        firstName={firstName}
        householdName={householdName}
      />

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Demo Household
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#111827]">
            Explore a fully organized sample vault
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Use the navigation to explore sample devices,
            warranties, subscriptions, maintenance tasks,
            network information, and account settings.
          </p>
        </section>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Devices"
          value={deviceCount}
          description="Saved in your vault"
          icon={Laptop}
        />

        <StatCard
          label="Protected Value"
          value={`$${protectedValue.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 0,
            }
          )}`}
          description="Based on purchase prices"
          icon={WalletCards}
        />

        <StatCard
          label="Documents"
          value={documentCount}
          description="Manuals, receipts, and files"
          icon={FileText}
        />

        <StatCard
          label="Active Warranties"
          value={activeWarrantyCount}
          description="Coverage currently active"
          icon={ShieldCheck}
        />
      </section>

      <TechnologyScoreCard
        score={vaultScore}
      />

      <RecentDevices
        devices={recentDevices}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <WarrantyAlerts
          warranties={warrantyAlerts}
        />

        <QuickActions />
      </section>
    </main>
  );
}