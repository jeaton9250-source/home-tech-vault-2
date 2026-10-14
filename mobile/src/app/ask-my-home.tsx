import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useNetworkState } from "expo-network";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Sparkles, Wrench } from "lucide-react-native";
import { Card, PrimaryButton, SecondaryButton } from "@/components/ui";
import { IssueHistory } from "@/components/issue-history";
import {
  askMyHome,
  identifyDevicePhoto,
  findTroubleshootingDocument,
} from "@/lib/home-tech-vault-api";
import { viewVaultDocument } from "@/lib/document-viewer";
import {
  ISSUE_CATEGORIES,
  urgentHelp,
  type HelpResult,
} from "@/lib/troubleshooting-contract";
import { saveIssue } from "@/lib/troubleshooting-history";
import { useAuth } from "@/providers/auth-provider";
import { useVaultData } from "@/providers/vault-data-provider";
import { colors, fonts } from "@/theme";
type Message = { role: "user" | "assistant"; content: string };
export default function AskMyHomeScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{
    issueId?: string;
    deviceId?: string;
    mode?: string;
  }>();
  return (
    <AskMyHomeSession
      key={`${auth.user?.id || auth.mode}:${params.issueId || ""}:${params.deviceId || ""}:${params.mode || ""}`}
    />
  );
}
function AskMyHomeSession() {
  const params = useLocalSearchParams<{
    mode?: string;
    deviceId?: string;
    issueId?: string;
    description?: string;
    category?: string;
  }>();
  const router = useRouter();
  const auth = useAuth();
  const vault = useVaultData();
  const network = useNetworkState();
  const inFlight = useRef(false);
  const savingRef = useRef(false);
  const consentRef = useRef(false);
  const [deviceId, setDeviceId] = useState(params.deviceId || "");
  const [category, setCategory] = useState(params.category || "Other");
  const [question, setQuestion] = useState(params.description || "");
  const [description, setDescription] = useState(params.description || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState<HelpResult | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(params.issueId || "");
  const [notice, setNotice] = useState("");
  const [resolution, setResolution] = useState("");
  const troubleshooting = params.mode === "troubleshooting";
  const offline =
    network.isConnected === false || network.isInternetReachable === false;
  const device = vault.devices.find((d) => d.id === deviceId);

  async function attach(camera: boolean) {
    if (inFlight.current || !consent || auth.isDemo || !auth.session) return;
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Camera unavailable",
            "You can continue without a photo. Camera access can be changed in Settings.",
            [
              { text: "OK" },
              ...(permission.canAskAgain
                ? []
                : [
                    {
                      text: "Settings",
                      onPress: () => void Linking.openSettings(),
                    },
                  ]),
            ],
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        base64: true,
        exif: false,
        quality: 0.45,
      };
      const picked = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!picked.canceled && picked.assets[0]) {
        if (
          !picked.assets[0].base64 ||
          picked.assets[0].base64.length > 8_000_000
        )
          throw new Error("Choose a smaller photo.");
        setPhoto(picked.assets[0]);
        setError("");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The photo could not be attached.",
      );
    }
  }
  async function send(override?: string) {
    const text = (override || question).trim();
    if (inFlight.current || !text) return;
    if (override) setQuestion(text);
    const localSafety =
      result?.urgency === "emergency"
        ? result
        : urgentHelp(
            [
              ...messages
                .filter((m) => m.role === "user")
                .map((m) => m.content),
              text,
            ].join("\n"),
          );
    if (localSafety) {
      setResult(localSafety);
      setDescription((old) => old || text);
      setMessages((old) => [
        ...old,
        { role: "user", content: text },
        { role: "assistant", content: localSafety.summary },
      ]);
      setQuestion("");
      return;
    }
    if (offline) {
      setError(
        "You’re offline. Reconnect to ask your home; your question is still here.",
      );
      return;
    }
    if (!auth.session || auth.isDemo) {
      setError("Sign in to use Ask My Home with your own vault.");
      return;
    }
    if (!consent) {
      setError(
        "Review the AI data-sharing notice and choose Continue with AI first.",
      );
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let photoText = "";
      if (photo?.base64) {
        const vision = await identifyDevicePhoto(
          `data:image/jpeg;base64,${photo.base64}`,
          auth.session.access_token,
          true,
        );
        photoText = (vision.extraction?.visibleText || []).join("\n");
        if (!photoText)
          throw new Error(
            "No readable text was found. Remove the photo or try a clearer one.",
          );
      }
      if (!consentRef.current) return;
      const reply = await askMyHome(
        {
          question: text,
          deviceId: deviceId || null,
          category,
          mode: troubleshooting ? "troubleshooting" : "mobile-chat",
          aiConsent: consent,
          photoText,
          history: messages,
        },
        auth.session.access_token,
      );
      if (!consentRef.current) return;
      setResult(reply);
      setDescription((old) => old || text);
      setMessages((old) => [
        ...old,
        { role: "user", content: text },
        {
          role: "assistant",
          content: [
            reply.summary,
            ...reply.steps,
            reply.safety,
            reply.nextQuestion,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ]);
      setQuestion("");
      setPhoto(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Ask My Home could not connect. Please try again.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  async function save(resolved: boolean) {
    if (
      savingRef.current ||
      !result ||
      !description ||
      !auth.user ||
      auth.isDemo
    )
      return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const issue = await saveIssue({
        id: savedId || undefined,
        userId: auth.user.id,
        deviceId: deviceId || null,
        category,
        description,
        summary: result.summary,
        resolved,
        resolution,
      });
      setSavedId(issue.id);
      setNotice(
        resolved
          ? "Issue resolved and saved to your history."
          : "Issue saved to your history.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this issue.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  function changeContext(id: string, nextCategory = category) {
    setDeviceId(id);
    setCategory(nextCategory);
    setMessages([]);
    setResult(null);
    setDescription("");
    setSavedId("");
    setNotice("");
    setResolution("");
    setPhoto(null);
  }
  async function openDocument(type: string) {
    try {
      const document =
        auth.user && !auth.isDemo
          ? await findTroubleshootingDocument(
              deviceId,
              auth.user.id,
              type,
              device?.name || "Device",
            )
          : vault.documents.find(
              (d) =>
                d.deviceId === deviceId &&
                d.type.toLowerCase() === type.toLowerCase(),
            );
      if (!document) {
        setNotice(
          `No ${type.toLowerCase()} document was found for this device.`,
        );
        return;
      }
      await viewVaultDocument(document);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This document could not be opened. Please try again.",
      );
    }
  }
  const prompts = troubleshooting
    ? [
        "My device will not turn on",
        "My Wi-Fi keeps dropping",
        "An error code is showing",
      ]
    : [
        "Which warranties are ending soon?",
        "What maintenance is coming up?",
        "What details are missing from my vault?",
      ];
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={styles.back}
          >
            <ChevronLeft color={colors.navy} />
          </Pressable>
          <Text style={styles.title}>
            {troubleshooting ? "Something isn’t working?" : "Ask My Home"}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.body}>
            {troubleshooting
              ? "Choose a device or category, then tell us what happened."
              : "Ask anything about your home. Your saved details make the answers more useful."}
          </Text>
          <Card style={styles.panel}>
            <Text style={styles.label}>Safety comes first</Text>
            <Text style={styles.body}>
              Gas smell, carbon monoxide alarm, fire, smoke, sparks or water
              near electricity? Stop troubleshooting. Move to safety and call
              local emergency services from a safe location. AI cannot confirm
              your home is safe.
            </Text>
          </Card>
          {auth.isDemo || !auth.session ? (
            <Card style={styles.panel}>
              <Text style={styles.body}>
                Sign in to ask about your own home and save issues. No demo data
                is sent to AI.
              </Text>
              <PrimaryButton
                label="Sign in"
                onPress={() => router.push("/sign-in")}
              />
            </Card>
          ) : null}
          {!consent && auth.session && !auth.isDemo ? (
            <Card style={styles.panel}>
              <Sparkles color={colors.oliveDark} />
              <Text style={styles.label}>Before using AI</Text>
              <Text style={styles.body}>
                Your question, recent conversation and relevant user-owned
                device details, document names/types, purchase and warranty
                dates, maintenance, subscriptions and saved issues are sent to
                Groq to generate an answer. Attached photos are sent to OpenAI
                to read visible text; that text is then sent to Groq. Do not
                include passwords or sensitive personal information. HTV does
                not save these photos or the full conversation. Provider
                processing is described in the privacy policy. AI can make
                mistakes.
              </Text>
              <SecondaryButton
                label="Read privacy policy"
                onPress={() =>
                  void Linking.openURL(
                    `${process.env.EXPO_PUBLIC_WEB_URL || "https://www.hometechvault.com"}/privacy`,
                  )
                }
              />
              <PrimaryButton
                label="Continue with AI"
                onPress={() => {
                  consentRef.current = true;
                  setConsent(true);
                }}
              />
              <SecondaryButton
                label="Back to my vault"
                onPress={() => router.back()}
              />
            </Card>
          ) : consent ? (
            <SecondaryButton
              label="Stop sharing with AI"
              onPress={() => {
                consentRef.current = false;
                setConsent(false);
                setPhoto(null);
                setMessages([]);
                setResult(null);
              }}
            />
          ) : null}
          <Text style={styles.label}>Device</Text>
          <ScrollView
            horizontal
            contentContainerStyle={{ flexDirection: "row", gap: 8 }}
          >
            <Chip
              label="Whole home / no device"
              selected={!deviceId}
              disabled={busy || saving}
              onPress={() => changeContext("")}
            />
            {vault.devices.map((d) => (
              <Chip
                key={d.id}
                label={d.name}
                selected={deviceId === d.id}
                disabled={busy || saving}
                onPress={() => changeContext(d.id)}
              />
            ))}
          </ScrollView>
          {device ? (
            <Text style={styles.body}>
              {device.brand} · {device.model}
            </Text>
          ) : null}
          {troubleshooting ? (
            <>
              <Text style={styles.label}>Issue category</Text>
              <View style={styles.chips}>
                {ISSUE_CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={category === c}
                    disabled={busy || saving}
                    onPress={() => changeContext(deviceId, c)}
                  />
                ))}
              </View>
            </>
          ) : null}
          {!messages.length && !result ? (
            <View style={{ gap: 8 }}>
              {prompts.map((p) => (
                <SecondaryButton
                  key={p}
                  label={p}
                  onPress={() => setQuestion(p)}
                />
              ))}
            </View>
          ) : null}
          {messages
            .filter(
              (m, i) =>
                !(
                  result &&
                  m.role === "assistant" &&
                  i === messages.length - 1
                ),
            )
            .map((m, i) => (
              <View
                key={i}
                style={[
                  styles.message,
                  m.role === "user" && styles.userMessage,
                ]}
              >
                <Text style={styles.label}>
                  {m.role === "user" ? "You" : "Ask My Home · AI"}
                </Text>
                <Text selectable style={styles.body}>
                  {m.content}
                </Text>
              </View>
            ))}
          {result ? (
            <Card style={styles.panel}>
              <Wrench
                color={
                  result.urgency === "routine" ? colors.oliveDark : colors.rust
                }
              />
              <Text style={styles.label}>
                {result.urgency === "emergency"
                  ? "Get emergency help"
                  : result.urgency === "professional"
                    ? "Contact a professional"
                    : "Try these checks"}
              </Text>
              <Text style={styles.body}>{result.summary}</Text>
              {result.steps.map((step, i) => (
                <Text key={i} style={styles.body}>
                  {i + 1}. {step}
                </Text>
              ))}
              {result.safety ? (
                <Text
                  accessibilityRole="alert"
                  style={[styles.body, { color: colors.rust }]}
                >
                  {result.safety}
                </Text>
              ) : null}
              {result.nextQuestion ? (
                <Text style={styles.label}>{result.nextQuestion}</Text>
              ) : null}
              {result.warranty && device ? (
                <Text style={styles.body}>{result.warranty.message}</Text>
              ) : null}
              <SecondaryButton
                label="Report this answer"
                onPress={() =>
                  router.push({
                    pathname: "/feedback",
                    params: {
                      kind: "issue",
                      subject: "Ask My Home answer",
                      message: `Please review this AI answer:\n${result.summary}\n${result.steps.join("\n")}`,
                    },
                  })
                }
              />
              {device ? (
                <>
                  <SecondaryButton
                    label="View manual"
                    onPress={() => void openDocument("Manual")}
                  />
                  <SecondaryButton
                    label="View warranty"
                    onPress={() => void openDocument("Warranty")}
                  />
                  <SecondaryButton
                    label="View receipts and purchase details"
                    onPress={() =>
                      router.push({
                        pathname: "/device/[id]",
                        params: { id: deviceId },
                      })
                    }
                  />
                </>
              ) : null}
              {troubleshooting ? (
                <>
                  <TextInput
                    accessibilityLabel="What fixed it (optional)"
                    placeholder="What fixed it? (optional)"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={resolution}
                    onChangeText={setResolution}
                    maxLength={1200}
                    editable={!saving}
                  />
                  <PrimaryButton
                    label={saving ? "Saving…" : "That fixed it"}
                    disabled={saving || offline || auth.isDemo || !auth.session}
                    onPress={() => void save(true)}
                  />
                  <SecondaryButton
                    label="Still not working"
                    onPress={() =>
                      void send("Still not working. What should I check next?")
                    }
                  />
                  <PrimaryButton
                    label={saving ? "Saving…" : "Save issue"}
                    disabled={saving || offline || auth.isDemo || !auth.session}
                    onPress={() => void save(false)}
                  />
                </>
              ) : null}
            </Card>
          ) : null}
          {photo ? (
            <View style={{ gap: 8 }}>
              <Image
                alt="Attached troubleshooting photo"
                source={{ uri: photo.uri }}
                style={{ height: 160, borderRadius: 16 }}
                contentFit="contain"
              />
              <SecondaryButton
                label="Remove photo"
                onPress={() => {
                  if (!busy) setPhoto(null);
                }}
              />
            </View>
          ) : null}
          {busy ? (
            <View accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.olive} />
              <Text style={styles.body}>Reading your home details…</Text>
            </View>
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={{ color: colors.rust }}>
              {error}
            </Text>
          ) : null}
          {notice ? (
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {notice}
            </Text>
          ) : null}
          {offline ? (
            <Text style={{ color: colors.rust }}>
              You’re offline. Reconnect to use AI or save an issue.
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel="Your home question"
            placeholder={
              troubleshooting
                ? "What happened? Include any error code…"
                : "Ask a question…"
            }
            placeholderTextColor={colors.muted}
            value={question}
            onChangeText={setQuestion}
            maxLength={1200}
            multiline
            style={styles.input}
            editable={!busy}
          />
          {consent && !auth.isDemo ? (
            <View style={styles.chips}>
              <SecondaryButton
                label="Take a Photo"
                onPress={() => void attach(true)}
              />
              <SecondaryButton
                label="Attach photo"
                onPress={() => void attach(false)}
              />
            </View>
          ) : null}
          <PrimaryButton
            label={
              busy
                ? "Thinking…"
                : troubleshooting
                  ? "Get Help"
                  : "Ask a question"
            }
            disabled={busy || !question.trim()}
            onPress={() => void send()}
          />
          <Text style={styles.small}>
            AI guidance may be incomplete or incorrect. Check the manufacturer’s
            instructions before acting. Photos are read when you send your
            question and are not saved to issue history.
          </Text>
          <IssueHistory
            key={`${savedId}:${notice}`}
            deviceId={deviceId || undefined}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: colors.oliveWash }]}
    >
      <Text style={styles.body}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  back: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, color: colors.navy, fontFamily: fonts.serif, fontSize: 25 },
  content: { padding: 20, gap: 16 },
  panel: { padding: 18, gap: 12 },
  label: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: fonts.sans,
  },
  body: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.sans,
  },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  input: {
    minHeight: 90,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontSize: 16,
    textAlignVertical: "top",
  },
  message: {
    padding: 16,
    gap: 6,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  userMessage: { backgroundColor: colors.oliveWash, marginLeft: 22 },
});
