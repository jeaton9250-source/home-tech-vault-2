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

import DashboardHero from "@/components/dashboard/DashboardHero";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import TechnologyScoreCard from "@/components/dashboard/TechnologyScoreCard";

import RecentDevices, {
  type RecentDevice,
} from "@/components/dashboard/RecentDevices";

import WarrantyAlerts, {
  type WarrantyDevice,
} from "@/components/dashboard/WarrantyAlerts";

import {
  calculateVaultScore,
  type VaultDevice,
  type VaultScoreResult,
} from "@/lib/calculateVaultScore";

type DeviceRow = VaultDevice & {
  device_name: string | null;
  brand: string | null;
};

type ImageRow = {
  device_id: string;
  image_url: string;
};

type DeviceIdRow = {
  device_id: string;
};

const initialVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("Homeowner");
  const [householdName, setHouseholdName] =
    useState("My Home Tech Vault");

  const [deviceCount, setDeviceCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [activeWarrantyCount, setActiveWarrantyCount] =
    useState(0);
  const [protectedValue, setProtectedValue] = useState(0);

  const [vaultScore, setVaultScore] =
    useState<VaultScoreResult>(initialVaultScore);

  const [recentDevices, setRecentDevices] = useState<
    RecentDevice[]
  >([]);

  const [warrantyAlerts, setWarrantyAlerts] = useState<
    WarrantyDevice[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setErrorMessage("Please sign in to view your dashboard.");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("full_name, household_name")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error("Profile loading error:", profileError);
        }

        const displayName =
          profile?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Homeowner";

        const resolvedFirstName =
          displayName.split(" ")[0] || "Homeowner";

        setFirstName(resolvedFirstName);

        setHouseholdName(
          profile?.household_name?.trim() ||
            `${resolvedFirstName}'s Home Tech Vault`
        );

        const { data: devices, error: devicesError } =
          await supabase
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
                warranty_date
              `
            )
            .eq("user_id", user.id);

        if (devicesError) {
          throw devicesError;
        }

        const deviceRows = (devices || []) as DeviceRow[];

        setDeviceCount(deviceRows.length);

        setProtectedValue(
          deviceRows.reduce(
            (total, device) =>
              total + Number(device.purchase_price || 0),
            0
          )
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeWarranties = deviceRows.filter(
          (device) => {
            if (!device.warranty_date) {
              return false;
            }

            const expiration = new Date(
              `${device.warranty_date}T23:59:59`
            );

            return expiration >= today;
          }
        );

        setActiveWarrantyCount(activeWarranties.length);

        const expiringSoon: WarrantyDevice[] = deviceRows
          .filter((device) => Boolean(device.warranty_date))
          .map((device) => {
            const expiration = new Date(
              `${device.warranty_date}T23:59:59`
            );

            const daysRemaining = Math.ceil(
              (expiration.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return {
              id: device.id,
              device_name: device.device_name,
              warranty_date: device.warranty_date || null,
              days_remaining: daysRemaining,
            };
          })
          .filter(
            (device) =>
              device.days_remaining >= 0 &&
              device.days_remaining <= 60
          )
          .sort(
            (a, b) =>
              a.days_remaining - b.days_remaining
          )
          .slice(0, 4);

        setWarrantyAlerts(expiringSoon);

        const { count: documents, error: documentCountError } =
          await supabase
            .from("device_documents")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("user_id", user.id);

        if (documentCountError) {
          console.error(
            "Document count error:",
            documentCountError
          );
        }

        setDocumentCount(documents || 0);

        const vaultDevices: VaultDevice[] = deviceRows.map(
          (device) => ({
            id: device.id,
            serial_number: device.serial_number,
            purchase_date: device.purchase_date,
            warranty_date: device.warranty_date,
            purchase_price: device.purchase_price,
            location: device.location,
            category: device.category,
          })
        );

        const allDeviceIds = vaultDevices.map(
          (device) => device.id
        );

        if (allDeviceIds.length > 0) {
          const [
            photoResult,
            documentResult,
            maintenanceResult,
          ] = await Promise.all([
            supabase
              .from("device_images")
              .select("device_id")
              .eq("user_id", user.id)
              .in("device_id", allDeviceIds),

            supabase
              .from("device_documents")
              .select("device_id")
              .eq("user_id", user.id)
              .in("device_id", allDeviceIds),

            supabase
              .from("device_events")
              .select("device_id")
              .eq("user_id", user.id)
              .in("device_id", allDeviceIds)
              .in("event_type", [
                "Maintenance",
                "Repair",
                "Cleaning",
                "Software Update",
              ]),
          ]);

          if (photoResult.error) {
            console.error(
              "Score photo query error:",
              photoResult.error
            );
          }

          if (documentResult.error) {
            console.error(
              "Score document query error:",
              documentResult.error
            );
          }

          if (maintenanceResult.error) {
            console.error(
              "Score maintenance query error:",
              maintenanceResult.error
            );
          }

          const deviceIdsWithPhotos = new Set(
            ((photoResult.data || []) as DeviceIdRow[]).map(
              (record) => record.device_id
            )
          );

          const deviceIdsWithDocuments = new Set(
            ((documentResult.data || []) as DeviceIdRow[]).map(
              (record) => record.device_id
            )
          );

          const deviceIdsWithMaintenance = new Set(
            ((maintenanceResult.data || []) as DeviceIdRow[]).map(
              (record) => record.device_id
            )
          );

          setVaultScore(
            calculateVaultScore({
              devices: vaultDevices,
              deviceIdsWithPhotos,
              deviceIdsWithDocuments,
              deviceIdsWithMaintenance,
            })
          );
        } else {
          setVaultScore(
            calculateVaultScore({
              devices: [],
              deviceIdsWithPhotos: new Set<string>(),
              deviceIdsWithDocuments: new Set<string>(),
              deviceIdsWithMaintenance: new Set<string>(),
            })
          );
        }

        const latestDevices = deviceRows
          .slice(-6)
          .reverse();

        if (latestDevices.length === 0) {
          setRecentDevices([]);
          return;
        }

        const latestIds = latestDevices.map(
          (device) => device.id
        );

        const { data: imageRows, error: imageError } =
          await supabase
            .from("device_images")
            .select("device_id, image_url")
            .eq("user_id", user.id)
            .in("device_id", latestIds)
            .order("created_at", { ascending: true });

        if (imageError) {
          console.error(
            "Recent device image error:",
            imageError
          );
        }

        const firstImageByDevice = new Map<
          string,
          string
        >();

        for (const image of
          (imageRows || []) as ImageRow[]) {
          if (!firstImageByDevice.has(image.device_id)) {
            firstImageByDevice.set(
              image.device_id,
              image.image_url
            );
          }
        }

        const devicesWithPhotos = await Promise.all(
          latestDevices.map(async (device) => {
            const imagePath =
              firstImageByDevice.get(device.id);

            if (!imagePath) {
              return {
                id: device.id,
                device_name: device.device_name,
                brand: device.brand,
                location: device.location || null,
                photo_url: "",
              };
            }

            const {
              data: signedData,
              error: signedUrlError,
            } = await supabase.storage
              .from("device-images")
              .createSignedUrl(imagePath, 3600);

            if (signedUrlError) {
              console.error(
                "Recent image signed URL error:",
                signedUrlError
              );
            }

            return {
              id: device.id,
              device_name: device.device_name,
              brand: device.brand,
              location: device.location || null,
              photo_url: signedData?.signedUrl || "",
            };
          })
        );

        setRecentDevices(devicesWithPhotos);
      } catch (error) {
        console.error("Dashboard loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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
      <main className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700">
        <h1 className="text-2xl font-bold">
          Unable to load dashboard
        </h1>

        <p className="mt-3">{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <DashboardHero
        firstName={firstName}
        householdName={householdName}
      />

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

      <TechnologyScoreCard score={vaultScore} />

      <RecentDevices devices={recentDevices} />

      <section className="grid gap-6 xl:grid-cols-2">
        <WarrantyAlerts warranties={warrantyAlerts} />
        <QuickActions />
      </section>
    </main>
  );
}