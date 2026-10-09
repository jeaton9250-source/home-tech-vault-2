"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Tv, Refrigerator, WashingMachine, Thermometer, Router, Camera, Plus,
  Loader2,
  Upload,
} from "lucide-react";

import OnboardingShell, {
  OnboardingActions,
  OnboardingDescription,
  OnboardingEyebrow,
  OnboardingField,
  OnboardingTitle,
  inputClassName,
} from "@/components/onboarding/OnboardingShell";

import dynamic from "next/dynamic";

const SmartPhotoAdd = dynamic(() => import("@/components/devices/SmartPhotoAdd"));

import Button from "@/components/ui/Button";
import {
  sendWelcomeEmailForCurrentUser,
} from "@/app/onboarding/actions";

import { usePermissions } from "@/hooks/usePermissions";
import { useHouseholdLimits } from "@/hooks/useHouseholdLimits";

import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";

import { supabase } from "@/lib/supabase";

import {
  applyHouseholdScope,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";

import {
  completeOnboarding,
  getErrorMessage,
  loadOnboardingDataSnapshot,
  loadOnboardingProfile,
  nextStep,
  previousStep,
  resolveResumeStep,
  saveHomeName,
  saveOnboardingStep,
  skipOnboarding,
  trackFirstDeviceAdded,
  trackFirstDocumentUploaded,
  trackNetworkSetupCompleted,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
} from "@/lib/onboarding";
import {
  trackAccountCreated,
  trackHomeNamed,
} from "@/lib/analytics/activation";

import type {
  OnboardingDataSnapshot,
  OnboardingStep,
} from "@/lib/onboarding/types";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-sunken">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Opening your home record…
          </div>
        </main>
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const restart =
    searchParams.get("restart") === "1";

  const {
    user,
    isDemo,
    canCreate,
    canUpload,
    canEdit,
    householdId,
    householdOwnerId,
    loading: permissionsLoading,
  } = usePermissions();

  const quota = useHouseholdLimits();


  useEffect(() => {
    if (
      permissionsLoading ||
      isDemo ||
      !user ||
      restart
    ) {
      return;
    }

    void sendWelcomeEmailForCurrentUser()
      .catch((error) => {
        console.error(
          "[welcome-email] unable to start welcome delivery",
          error
        );
      });
  }, [
    permissionsLoading,
    isDemo,
    user,
    restart,
  ]);

  useEffect(() => {
    if (
      !user ||
      restart
    ) {
      return;
    }

    const createdAt =
      Date.parse(
        user.created_at ?? ""
      );

    if (
      !Number.isFinite(
        createdAt
      )
    ) {
      return;
    }

    const accountAge =
      Date.now() -
      createdAt;

    const isNewAccount =
      accountAge >= 0 &&
      accountAge <=
        30 * 60 * 1000;

    if (!isNewAccount) {
      return;
    }

    const rawProvider =
      user.app_metadata
        ?.provider;

    const provider =
      rawProvider === "google"
        ? "google"
        : rawProvider === "apple"
          ? "apple"
          : "email";

    trackAccountCreated(
      provider
    );
  }, [
    user,
    restart,
  ]);

  const [initializing, setInitializing] =
    useState(true);

  const [step, setStep] =
    useState<OnboardingStep>("welcome");

  const [captureMode, setCaptureMode] = useState<"choose" | "manual" | "photo">("choose");
  const [serialNumber, setSerialNumber] = useState("");

  const [snapshot, setSnapshot] =
    useState<OnboardingDataSnapshot | null>(
      null
    );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [homeName, setHomeName] =
    useState("");

  const [deviceName, setDeviceName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [modelNumber, setModelNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [warrantyDate, setWarrantyDate] =
    useState("");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [devices, setDevices] = useState<
    { id: string; device_name: string }[]
  >([]);

  const [uploadDeviceId, setUploadDeviceId] =
    useState("");

  const [fileType, setFileType] =
    useState("Receipt");

  const [documentName, setDocumentName] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [isp, setIsp] = useState("");

  const [routerBrand, setRouterBrand] =
    useState("");

  const [wifiName, setWifiName] =
    useState("");

  const [networkId, setNetworkId] =
    useState<string | null>(null);

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    if (isDemo) {
      router.replace("/demo");
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/onboarding"
      );
      return;
    }

    const userId = user.id;

    let mounted = true;

    async function initialize() {
      try {
        setInitializing(true);
        setErrorMessage("");

        const profile =
          await loadOnboardingProfile(
            supabase,
            userId
          );

        if (
          (profile?.onboarding_completed_at ||
            profile?.onboarding_skipped_at) &&
          !restart
        ) {
          router.replace("/dashboard");
          return;
        }

        if (
          !restart &&
          !profile?.onboarding_step &&
          !profile?.onboarding_completed_at &&
          !profile?.onboarding_skipped_at
        ) {
          await saveOnboardingStep(
            supabase,
            userId,
            "welcome"
          );
        }

        const dataSnapshot =
          await loadOnboardingDataSnapshot(
            supabase,
            {
              userId,
              householdId,
              householdOwnerId,
            }
          );

        if (!mounted) {
          return;
        }

        setSnapshot(dataSnapshot);


        const resumeStep =
          resolveResumeStep(
            dataSnapshot,
            profile?.household_name ??
              null,
            profile?.onboarding_step ??
              null,
            restart
          );

        setStep(resumeStep);

        setHomeName(
          dataSnapshot.sharedHouseholdName ||
            profile?.household_name?.trim() ||
            ""
        );

        setDeviceCount(
          dataSnapshot.deviceCount
        );
        setDocumentCount(
          dataSnapshot.documentCount
        );

        const devicesResult =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select("id, device_name"),
            householdId,
            userId
          );

        if (!devicesResult.error) {
          const loadedDevices =
            (devicesResult.data ||
              []) as {
              id: string;
              device_name: string;
            }[];

          setDevices(loadedDevices);

          if (loadedDevices[0]?.id) {
            setUploadDeviceId(
              loadedDevices[0].id
            );
          }
        }

        if (dataSnapshot.networkConfigured) {
          const { data: networkRows } =
            await applyHouseholdScope(
              supabase
                .from("network_info")
                .select(
                  "id, isp, router_model, wifi_name"
                )
                .limit(1),
              householdId,
              userId
            );

          const row =
            (networkRows?.[0] as
              | {
                  id: string;
                  isp: string | null;
                  router_model:
                    | string
                    | null;
                  wifi_name:
                    | string
                    | null;
                }
              | undefined) ?? null;

          if (row) {
            setNetworkId(row.id);
            setIsp(row.isp ?? "");
            setRouterBrand(
              row.router_model ?? ""
            );
            setWifiName(
              row.wifi_name ?? ""
            );
          }
        }

        trackOnboardingStarted(restart);
      } catch (error) {
        console.error(
          "Unable to initialize onboarding:",
          error
        );

        if (mounted) {
          setErrorMessage(
            getErrorMessage(
              error,
              "Unable to load onboarding."
            )
          );
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    permissionsLoading,
    householdId,
    householdOwnerId,
    restart,
    router,
  ]);

  useEffect(() => {
    if (
      step !== "complete" ||
      !user ||
      permissionsLoading
    ) {
      return;
    }

    const userId = user.id;

    let mounted = true;

    async function refreshCompletionData() {
      const dataSnapshot =
        await loadOnboardingDataSnapshot(
          supabase,
          {
            userId,
            householdId,
            householdOwnerId,
          }
        );

      if (mounted) {
        setSnapshot(dataSnapshot);
      }
    }

    void refreshCompletionData();

    return () => {
      mounted = false;
    };
  }, [
    step,
    user,
    permissionsLoading,
    householdId,
    householdOwnerId,
  ]);

  const deviceLimitReached =
    !quota.loading &&
    quota.limits.maxDevices !== null &&
    Math.max(
      deviceCount,
      quota.usage.devices
    ) >= quota.limits.maxDevices;

  const documentLimitReached =
    !quota.loading &&
    quota.limits.maxDocuments !== null &&
    Math.max(
      documentCount,
      quota.usage.documents
    ) >= quota.limits.maxDocuments;

  const sharedHouseholdLocked =
    Boolean(
      snapshot?.hasSharedHousehold &&
        snapshot.sharedHouseholdName
    );

  async function persistStep(
    next: OnboardingStep
  ) {
    if (!user) {
      return;
    }

    await saveOnboardingStep(
      supabase,
      user.id,
      next
    );

    setStep(next);
  }

  async function handleGetStarted() {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);

      trackOnboardingStepCompleted(
        "welcome"
      );

      if (!homeName.trim() && !sharedHouseholdLocked) {
        await saveHomeName(supabase, user.id, "My Home");
        setHomeName("My Home");
        trackHomeNamed();
      }
      await persistStep("device");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to begin your home record."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip(
    fromStep: OnboardingStep
  ) {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);
      trackOnboardingSkipped(fromStep);
      await skipOnboarding(
        supabase,
        user.id,
        fromStep
      );
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to skip onboarding."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHomeSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (
      !sharedHouseholdLocked &&
      !homeName.trim()
    ) {
      setErrorMessage(
        "Enter a name for your home."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (!sharedHouseholdLocked) {
        await saveHomeName(
          supabase,
          user.id,
          homeName
        );
      }

      if (
        !sharedHouseholdLocked
      ) {
        trackHomeNamed();
      }

      trackOnboardingStepCompleted("home");
      await persistStep("device");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save your home name."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeviceSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canCreate) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
      );
      return;
    }

    if (deviceLimitReached) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

      router.push(
        "/upgrade?reason=device-limit"
      );
      return;
    }

    if (!deviceName.trim()) {
      setErrorMessage(
        "Enter a device name."
      );
      return;
    }

    if (!category.trim()) {
      setErrorMessage(
        "Choose a category."
      );
      return;
    }

    if (!brand.trim()) {
      setErrorMessage("Enter a brand.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage(
        "Enter a room or location."
      );
      return;
    }

    try {
      setSubmitting(true);

      const hadDevices =
        deviceCount > 0;

      const { data: createdDevice, error } =
        await supabase
          .from("devices")
          .insert({
            user_id: user.id,
            household_id: householdId,
            device_name:
              deviceName.trim(),
            category:
              category.trim(),
            brand: brand.trim(),
            serial_number: serialNumber.trim() || null,
            model_number:
              modelNumber.trim() || null,
            purchase_date:
              purchaseDate || null,
            warranty_date:
              warrantyDate || null,
            location:
              location.trim(),
          })
          .select("id, device_name")
          .single();

      if (error) {
        if (
          error.message.includes(
            "DEVICE_LIMIT_REACHED"
          )
        ) {
          router.push(
            "/upgrade?reason=device-limit"
          );
          return;
        }

        throw error;
      }

      if (createdDevice?.id) {
        await recordActivity({
          activityType: "device.added",
          title:
            getDefaultActivityTitle(
              "device.added",
              deviceName.trim()
            ),
          description:
            "Device saved during onboarding.",
          userId: user.id,
          householdId,
          deviceId: createdDevice.id,
        });

        setDevices((current) => [
          ...current,
          {
            id: createdDevice.id,
            device_name:
              createdDevice.device_name,
          },
        ]);

        setUploadDeviceId(
          createdDevice.id
        );
      }

      setDeviceCount((count) => count + 1);

      if (!hadDevices) {
        trackFirstDeviceAdded(
          "onboarding"
        );
      }

      trackOnboardingStepCompleted(
        "device"
      );
      await persistStep("complete");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save your device."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDocumentSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canCreate || !canUpload) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
      );
      return;
    }

    if (documentLimitReached) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

      router.push(
        "/upgrade?reason=document-limit"
      );
      return;
    }

    if (!file) {
      setErrorMessage(
        "Choose a file to upload."
      );
      return;
    }

    const { validateDocumentUpload } =
      await import("@/lib/documents/uploadSecurity");
    const validation = validateDocumentUpload(file);

    if (!validation.ok) {
      setErrorMessage(validation.error);
      return;
    }

    try {
      setSubmitting(true);

      const hadDocuments =
        documentCount > 0;

      const safeFileName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );

      const ownerPath =
        householdId || user.id;

      const filePath =
        `${ownerPath}/${uploadDeviceId || "unassigned"}/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          upsert: false,
          contentType: validation.contentType,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: dbError } =
        await supabase
          .from("documents")
          .insert(
            withHouseholdInsertFields(
              {
                device_id:
                  uploadDeviceId || null,
                file_name: file.name,
                document_name:
                  documentName.trim() ||
                  file.name,
                file_url: filePath,
                file_type: fileType,
              },
              householdId,
              user.id
            )
          );

      if (dbError) {
        await supabase.storage
          .from("documents")
          .remove([filePath]);

        throw dbError;
      }

      await recordActivity({
        activityType:
          fileType === "Receipt"
            ? "receipt.uploaded"
            : "document.uploaded",
        title: "Document uploaded",
        description:
          "Saved during onboarding.",
        userId: user.id,
        householdId,
        deviceId:
          uploadDeviceId || null,
      });

      setDocumentCount(
        (count) => count + 1
      );

      if (!hadDocuments) {
        trackFirstDocumentUploaded(
          "onboarding"
        );
      }

      trackOnboardingStepCompleted(
        "document"
      );
      await persistStep("complete");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to upload your document."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNetworkSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canEdit) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
      );
      return;
    }

    const trimmedIsp = isp.trim();
    const trimmedRouter =
      routerBrand.trim();
    const trimmedWifi =
      wifiName.trim();

    if (
      !trimmedIsp &&
      !trimmedRouter &&
      !trimmedWifi
    ) {
      setErrorMessage(
        "Add at least one network detail, or skip for now."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        isp: trimmedIsp || null,
        router_model:
          trimmedRouter || null,
        wifi_name: trimmedWifi || null,
        modem_model: null,
        wifi_password_hint: null,
        guest_network: null,
        admin_url: null,
        speed_download: null,
        speed_upload: null,
        notes: null,
      };

      if (networkId) {
        const { error } =
          await applyHouseholdScope(
            supabase
              .from("network_info")
              .update(payload)
              .eq("id", networkId),
            householdId,
            user.id
          );

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("network_info")
          .insert(
            withHouseholdInsertFields(
              payload,
              householdId,
              user.id
            )
          );

        if (error) {
          throw error;
        }
      }

      trackNetworkSetupCompleted(
        "onboarding"
      );
      trackOnboardingStepCompleted(
        "network"
      );
      await persistStep("complete");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save Wi-Fi details."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish(destination = "/dashboard") {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);
      await completeOnboarding(
        supabase,
        user.id
      );
      trackOnboardingCompleted();
      router.replace(destination);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to finish onboarding."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function goBack() {
    const prior = previousStep(step);

    setErrorMessage("");

    try {
      await persistStep(prior);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to go back."
        )
      );
    }
  }

  async function skipCurrentStep() {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);

      if (step === "complete") {
        await handleFinish();
        return;
      }

      trackOnboardingStepCompleted(step);
      await persistStep(step === "document" ? "complete" : nextStep(step));
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to continue."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    permissionsLoading ||
    initializing
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Opening your home record…
        </div>
      </main>
    );
  }

  return (
    <OnboardingShell step={step}>
      {errorMessage && (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {step === "welcome" && (
        <form className="onboarding-welcome text-center" onSubmit={(event) => { event.preventDefault(); void handleGetStarted(); }}>
          <OnboardingEyebrow>Welcome home</OnboardingEyebrow>
          <div className="onboarding-welcome-title">
            <OnboardingTitle>Start building your home,<br /><span className="text-[#617c43]">one device at a time.</span></OnboardingTitle>
          </div>
          <div className="onboarding-welcome-copy mx-auto max-w-xl">
            <OnboardingDescription>Keep the details you’ll need later, starting with something you use every day.</OnboardingDescription>
          </div>
          <div className="onboarding-welcome-action mt-10 flex flex-col items-center gap-3">
            <Button type="submit" size="lg" loading={submitting} loadingLabel="Opening your home…" disabled={submitting}>Add my first device</Button>
            <Button type="button" variant="ghost" disabled={submitting} onClick={() => void handleSkip("welcome")}>Explore my vault instead</Button>
            <Button type="button" variant="link" disabled={submitting} onClick={() => void persistStep("home").catch((error) => setErrorMessage(getErrorMessage(error, "Unable to open home naming.")))}>Name my home first</Button>
          </div>
        </form>
      )}

      {step === "home" && (
        <form
          onSubmit={handleHomeSubmit}
        >
          <OnboardingEyebrow>
            Your home
          </OnboardingEyebrow>

          <OnboardingTitle>
            What do you call home?
          </OnboardingTitle>

          <OnboardingDescription>
            A name makes this record yours. Our First Home, Beach House,
            or simply Home — whatever feels right.
          </OnboardingDescription>

          {sharedHouseholdLocked ? (
            <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-sunken p-4">
              <p className="text-sm font-medium text-text-primary">
                Shared household
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                You&apos;re already part of{" "}
                <strong>
                  {
                    snapshot?.sharedHouseholdName
                  }
                </strong>
                . We&apos;ll use that
                household for your vault.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <OnboardingField
                label="Home name"
                htmlFor="home-name"
                required
              >
                <input
                  id="home-name"
                  value={homeName}
                  onChange={(event) =>
                    setHomeName(
                      event.target.value
                    )
                  }
                  placeholder="Eaton Residence"
                  className={
                    inputClassName
                  }
                  autoComplete="organization"
                />
              </OnboardingField>

              <p className="mt-2 text-xs text-text-tertiary">
                Examples: My Home, Beach
                House, Apartment
              </p>
            </div>
          )}

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void handleSkip("home")
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
            >
              Continue
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "device" && (
        <form
          onSubmit={handleDeviceSubmit}
        >
          <OnboardingEyebrow>
            Start with one device
          </OnboardingEyebrow>

          <OnboardingTitle>
            What should we remember first?
          </OnboardingTitle>

          <OnboardingDescription>
            Choose something you would want the details for if it needed
            a repair, a replacement, or a little care.
          </OnboardingDescription>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Choose a device">
            {[
              { label: "TV", category: "Entertainment", room: "Living Room", icon: Tv },
              { label: "Washer", category: "Appliance", room: "Laundry Room", icon: WashingMachine },
              { label: "Refrigerator", category: "Appliance", room: "Kitchen", icon: Refrigerator },
              { label: "Thermostat", category: "Climate", room: "Hallway", icon: Thermometer },
              { label: "Router", category: "Networking", room: "Living Room", icon: Router },
              { label: "Doorbell", category: "Security", room: "Front Porch", icon: Camera },
              { label: "Something else", category: "Other", room: "", icon: Plus },
            ].map(({ label, category: kind, room, icon: Icon }) => (
              <button key={label} type="button" disabled={submitting || !canCreate || deviceLimitReached}
                aria-pressed={deviceName === label}
                onClick={() => { setDeviceName(label === "Something else" ? "" : label); setCategory(kind); setLocation(room); setBrand(""); setModelNumber(""); setSerialNumber(""); setPurchaseDate(""); setWarrantyDate(""); setCaptureMode("manual"); }}
                className="flex min-h-28 flex-col items-start justify-center gap-3 rounded-2xl border border-[#172c3e]/15 bg-white/60 p-5 text-left text-base transition hover:border-[#617c43] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#617c43] aria-pressed:border-[#617c43] aria-pressed:bg-[#edf0e5] disabled:opacity-50">
                <Icon size={24} aria-hidden="true" /><span>{label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={submitting || !canCreate || deviceLimitReached} onClick={() => setCaptureMode("photo")}>Use a photo or barcode</Button>
            <Button type="button" variant="ghost" disabled={submitting || !canCreate || deviceLimitReached} onClick={() => setCaptureMode("manual")}>Enter the details myself</Button>
          </div>
          {captureMode === "photo" && !submitting && (
            <div className="mt-6">
              <SmartPhotoAdd onSelect={(match) => { setDeviceName(match.deviceName); setBrand(match.brand); setCategory(match.category); setModelNumber(match.modelNumber); setCaptureMode("manual"); }} onSerialNumberDetected={setSerialNumber} />
              <p className="mt-3 text-sm text-text-secondary">Review the suggested details before saving. You can always enter them yourself.</p>
            </div>
          )}
          {deviceLimitReached && (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-text-secondary">
              {quota.canUseProFeatures
                ? "This household has reached its device limit. Skip this step for now or contact a household admin."
                : "This household has reached the Home plan device limit. Upgrade the household for unlimited devices, or skip this step for now."}
            </div>
          )}

          {captureMode === "manual" && <div className="mt-8">
          <h2 className="mb-5 font-serif text-2xl">{deviceName ? `Let’s remember your ${deviceName.toLowerCase()}.` : "Tell us a little about it."}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <OnboardingField
              label="Device name"
              htmlFor="device-name"
              required
            >
              <input
                id="device-name"
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="MacBook Pro"
              />
            </OnboardingField>

            <OnboardingField
              label="Category"
              htmlFor="device-category"
              required
            >
              <input
                id="device-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Computer"
              />
            </OnboardingField>

            <OnboardingField
              label="Brand"
              htmlFor="device-brand"
              required
            >
              <input
                id="device-brand"
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Apple"
              />
            </OnboardingField>

            <OnboardingField
              label="Room or location"
              htmlFor="device-location"
              required
            >
              <input
                id="device-location"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Office"
              />
            </OnboardingField>

          </div>
          <details className="mt-6">
            <summary className="cursor-pointer text-base font-medium">Add a model, serial number or purchase details (optional)</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
            <OnboardingField label="Serial number" htmlFor="device-serial"><input id="device-serial" value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} className={inputClassName} /></OnboardingField>
            <OnboardingField
              label="Model"
              htmlFor="device-model"
            >
              <input
                id="device-model"
                value={modelNumber}
                onChange={(event) =>
                  setModelNumber(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>

            <OnboardingField
              label="Purchase date"
              htmlFor="device-purchase-date"
            >
              <input
                id="device-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(event) =>
                  setPurchaseDate(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>

            <OnboardingField
              label="Warranty date"
              htmlFor="device-warranty-date"
            >
              <input
                id="device-warranty-date"
                type="date"
                value={warrantyDate}
                onChange={(event) =>
                  setWarrantyDate(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>
          </div>

          </details>
          </div>}

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                deviceLimitReached || !canCreate || captureMode !== "manual"
              }
            >
              {submitting ? "Remembering…" : "Remember this device"}
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "document" && (
        <form
          onSubmit={handleDocumentSubmit}
        >
          <OnboardingEyebrow>
            Keep it together
          </OnboardingEyebrow>

          <OnboardingTitle>
            Upload one useful item
          </OnboardingTitle>

          <OnboardingDescription>
            A receipt or manual is easier to find when it stays with the device.
            Keep one here, or come back to this whenever you need it.
          </OnboardingDescription>

          {documentLimitReached && (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-text-secondary">
              {quota.canUseProFeatures
                ? "This household has reached its document limit. Skip this step for now or contact a household admin."
                : "This household has reached the Home plan document limit. Upgrade the household for unlimited uploads, or skip this step for now."}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {devices.length > 0 && (
              <OnboardingField
                label="Link to device"
                htmlFor="document-device"
              >
                <select
                  id="document-device"
                  value={uploadDeviceId}
                  onChange={(event) =>
                    setUploadDeviceId(
                      event.target.value
                    )
                  }
                  className={inputClassName}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {devices.map((device) => (
                    <option
                      key={device.id}
                      value={device.id}
                    >
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </OnboardingField>
            )}

            <OnboardingField
              label="Document type"
              htmlFor="document-type"
            >
              <select
                id="document-type"
                value={fileType}
                onChange={(event) =>
                  setFileType(
                    event.target.value
                  )
                }
                className={inputClassName}
              >
                <option value="Receipt">
                  Receipt
                </option>
                <option value="Warranty">
                  Warranty
                </option>
                <option value="Manual">
                  Manual
                </option>
                <option value="Photo">
                  Device photo
                </option>
              </select>
            </OnboardingField>

            <OnboardingField
              label="Document name"
              htmlFor="document-name"
            >
              <input
                id="document-name"
                value={documentName}
                onChange={(event) =>
                  setDocumentName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Purchase receipt"
              />
            </OnboardingField>

            <OnboardingField
              label="File"
              htmlFor="document-file"
            >
              <input
                id="document-file"
                type="file"
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ??
                      null
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>
          </div>

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                documentLimitReached
              }
            >
              <Upload size={17} />
              Upload
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "network" && (
        <form
          onSubmit={handleNetworkSubmit}
        >
          <OnboardingEyebrow>
            Connect the basics
          </OnboardingEyebrow>

          <OnboardingTitle>
            Add your home Wi-Fi details
          </OnboardingTitle>

          <OnboardingDescription>
            Save the essentials — no
            passwords required. You can
            add more detail later from
            Network.
          </OnboardingDescription>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <OnboardingField
              label="Internet provider"
              htmlFor="network-isp"
            >
              <input
                id="network-isp"
                value={isp}
                onChange={(event) =>
                  setIsp(event.target.value)
                }
                className={inputClassName}
                placeholder="Comcast"
              />
            </OnboardingField>

            <OnboardingField
              label="Router brand"
              htmlFor="network-router"
            >
              <input
                id="network-router"
                value={routerBrand}
                onChange={(event) =>
                  setRouterBrand(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Eero"
              />
            </OnboardingField>

            <OnboardingField
              label="Network name"
              htmlFor="network-name"
            >
              <input
                id="network-name"
                value={wifiName}
                onChange={(event) =>
                  setWifiName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Home-Network"
              />
            </OnboardingField>
          </div>

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
            >
              Save Wi-Fi details
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "complete" && (
        <>
          <OnboardingEyebrow>{homeName || "Your home record"}</OnboardingEyebrow>
          <OnboardingTitle>{deviceCount === 1 ? "Your first device is remembered." : deviceCount > 1 ? "Your home is taking shape." : "A place for your home’s details."}</OnboardingTitle>
          <OnboardingDescription>
            {deviceCount > 0 ? "You’ve saved something worth remembering. Its receipt, manual, warranty and care history can all live here too." : "Start whenever you’re ready. One appliance, one receipt, one useful detail at a time."}
          </OnboardingDescription>
          {devices.length > 0 && (
            <div className="mt-8 rounded-2xl border border-[#617c43]/25 bg-white/70 p-6" role="status">
              <p className="text-sm text-[#617c43]">Remembered in {homeName || "your home"}</p>
              <h2 className="mt-2 font-serif text-3xl">{devices[devices.length - 1].device_name}</h2>
              <p className="mt-3 text-base text-text-secondary">{deviceCount} {deviceCount === 1 ? "device" : "devices"} saved. There’s no need to do it all today.</p>
            </div>
          )}
          {documentCount > 0 && <p className="mt-5 text-base text-[#617c43]">{documentCount} {documentCount === 1 ? "document" : "documents"} kept with your home.</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" loading={submitting} disabled={submitting} onClick={() => devices.length ? void persistStep("document").catch((error) => setErrorMessage(getErrorMessage(error, "Unable to open document capture."))) : void handleFinish("/devices/add")}>
              {devices.length ? "Keep a receipt or manual with it" : "Remember a device"}
            </Button>
            {devices.length > 0 && <Button type="button" variant="secondary" disabled={submitting} onClick={() => void handleFinish("/devices/add")}>Add another device</Button>}
          </div>
          <Button type="button" variant="ghost" className="mt-4" disabled={submitting} onClick={() => void handleFinish()}>Open my home record</Button>
        </>
      )}
    </OnboardingShell>
  );
}
