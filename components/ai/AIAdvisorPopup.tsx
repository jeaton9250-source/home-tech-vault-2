"use client";

import {
  Bot,
  FileQuestion,
  Loader2,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type Device = {
  id: string;
  device_name: string | null;
  brand: string | null;
  category: string | null;
  location: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  warranty_date: string | null;
  serial_number: string | null;
};

type Subscription = {
  id: string;
  service_name: string | null;
  monthly_cost: number | null;
  billing_cycle: string | null;
  renewal_date: string | null;
};

type DeviceIdRow = {
  device_id: string;
};

const starterQuestions = [
  "Which warranties expire soon?",
  "Which devices are missing photos?",
  "What is my most valuable device?",
  "How much technology is in my office?",
  "Which devices are missing documents?",
  "How much do my subscriptions cost?",
];

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m your Home Tech Vault Advisor. Ask me about your devices, warranties, rooms, documents, values, or subscriptions.",
};

export default function AIAdvisorPopup() {
  const {
    user,
    isDemo,
    loading: permissionsLoading,
    canViewFeature,
  } = usePermissions();

  const { isOpen, close } = useAIAdvisor();

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  const [
    deviceIdsWithPhotos,
    setDeviceIdsWithPhotos,
  ] = useState<Set<string>>(new Set());

  const [
    deviceIdsWithDocuments,
    setDeviceIdsWithDocuments,
  ] = useState<Set<string>>(new Set());

  const [vaultLoading, setVaultLoading] =
    useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      welcomeMessage,
    ]);

  const loadVaultData = useCallback(async () => {
    if (permissionsLoading) {
      return;
    }

    if (isDemo || !user) {
      setDevices([]);
      setSubscriptions([]);
      setDeviceIdsWithPhotos(new Set());
      setDeviceIdsWithDocuments(new Set());
      setVaultLoading(false);
      return;
    }

    try {
      setVaultLoading(true);

      const {
        data: deviceData,
        error: deviceError,
      } = await supabase
        .from("devices")
        .select(
          `
            id,
            device_name,
            brand,
            category,
            location,
            purchase_price,
            purchase_date,
            warranty_date,
            serial_number
          `
        )
        .eq("user_id", user.id);

      if (deviceError) {
        throw deviceError;
      }

      const loadedDevices =
        (deviceData || []) as Device[];

      setDevices(loadedDevices);

      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabase
        .from("subscriptions")
        .select(
          `
            id,
            service_name,
            monthly_cost,
            billing_cycle,
            renewal_date
          `
        )
        .eq("user_id", user.id);

      if (subscriptionError) {
        console.error(
          "Unable to load subscriptions for AI Advisor:",
          subscriptionError
        );

        setSubscriptions([]);
      } else {
        setSubscriptions(
          (subscriptionData ||
            []) as Subscription[]
        );
      }

      const deviceIds = loadedDevices.map(
        (device) => device.id
      );

      if (deviceIds.length === 0) {
        setDeviceIdsWithPhotos(new Set());
        setDeviceIdsWithDocuments(
          new Set()
        );
        return;
      }

      const [
        photoResult,
        documentResult,
      ] = await Promise.all([
        supabase
          .from("device_images")
          .select("device_id")
          .eq("user_id", user.id)
          .in("device_id", deviceIds),

        supabase
          .from("device_documents")
          .select("device_id")
          .eq("user_id", user.id)
          .in("device_id", deviceIds),
      ]);

      if (photoResult.error) {
        console.error(
          "Unable to load photo data for AI Advisor:",
          photoResult.error
        );
      }

      if (documentResult.error) {
        console.error(
          "Unable to load document data for AI Advisor:",
          documentResult.error
        );
      }

      setDeviceIdsWithPhotos(
        new Set(
          (
            (photoResult.data ||
              []) as DeviceIdRow[]
          ).map(
            (row) => row.device_id
          )
        )
      );

      setDeviceIdsWithDocuments(
        new Set(
          (
            (documentResult.data ||
              []) as DeviceIdRow[]
          ).map(
            (row) => row.device_id
          )
        )
      );
    } catch (error) {
      console.error(
        "AI Advisor vault loading error:",
        error
      );

      setDevices([]);
      setSubscriptions([]);
      setDeviceIdsWithPhotos(new Set());
      setDeviceIdsWithDocuments(new Set());
    } finally {
      setVaultLoading(false);
    }
  }, [
    user,
    isDemo,
    permissionsLoading,
  ]);

  useEffect(() => {
    if (
      permissionsLoading ||
      isDemo ||
      !user
    ) {
      return;
    }

    loadVaultData();
  }, [
    user,
    isDemo,
    permissionsLoading,
    loadVaultData,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function submitMessage(
    event?: FormEvent<HTMLFormElement>,
    presetMessage?: string
  ) {
    event?.preventDefault();

    const question = (
      presetMessage || message
    ).trim();

    if (
      !question ||
      sending ||
      isDemo ||
      !user
    ) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setSending(true);

    try {
      if (vaultLoading) {
        await loadVaultData();
      }

      await new Promise((resolve) =>
        window.setTimeout(resolve, 350)
      );

      const answer =
        generateVaultAnswer(question);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "AI Advisor error:",
        error
      );

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I couldn’t process that request. Please refresh your vault and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function generateVaultAnswer(
    question: string
  ) {
    const normalized =
      question.toLowerCase();

    if (devices.length === 0) {
      return "Your vault does not contain any devices yet. Add your first device and I’ll be able to analyze it.";
    }

    if (
      normalized.includes(
        "most valuable"
      ) ||
      normalized.includes(
        "most expensive"
      ) ||
      normalized.includes(
        "worth the most"
      )
    ) {
      const mostValuable = [
        ...devices,
      ].sort(
        (first, second) =>
          Number(
            second.purchase_price || 0
          ) -
          Number(
            first.purchase_price || 0
          )
      )[0];

      return `${
        mostValuable.device_name ||
        "Your unnamed device"
      } is currently your most valuable device at ${formatCurrency(
        mostValuable.purchase_price
      )}.`;
    }

    if (
      normalized.includes(
        "total value"
      ) ||
      normalized.includes(
        "everything worth"
      ) ||
      normalized.includes(
        "technology worth"
      ) ||
      normalized.includes(
        "spent on technology"
      )
    ) {
      const total = devices.reduce(
        (sum, device) =>
          sum +
          Number(
            device.purchase_price || 0
          ),
        0
      );

      return `Your vault contains ${
        devices.length
      } device${
        devices.length === 1 ? "" : "s"
      } with a combined recorded value of ${formatCurrency(
        total
      )}.`;
    }

    if (
      normalized.includes("warrant") &&
      (
        normalized.includes("soon") ||
        normalized.includes("next") ||
        normalized.includes("expire")
      )
    ) {
      return buildWarrantyAnswer();
    }

    if (
      normalized.includes(
        "missing photo"
      ) ||
      normalized.includes(
        "without photo"
      ) ||
      normalized.includes(
        "need photos"
      )
    ) {
      const missing = devices.filter(
        (device) =>
          !deviceIdsWithPhotos.has(
            device.id
          )
      );

      return buildDeviceListAnswer(
        missing,
        "Every device in your vault has at least one photo.",
        "The following devices are missing photos:"
      );
    }

    if (
      normalized.includes(
        "missing document"
      ) ||
      normalized.includes(
        "without document"
      ) ||
      normalized.includes(
        "missing receipt"
      ) ||
      normalized.includes(
        "without receipt"
      ) ||
      normalized.includes(
        "missing manual"
      )
    ) {
      const missing = devices.filter(
        (device) =>
          !deviceIdsWithDocuments.has(
            device.id
          )
      );

      return buildDeviceListAnswer(
        missing,
        "Every device in your vault has at least one document.",
        "The following devices do not have documents uploaded:"
      );
    }

    if (
      normalized.includes(
        "missing serial"
      ) ||
      normalized.includes(
        "without serial"
      )
    ) {
      const missing = devices.filter(
        (device) =>
          !device.serial_number?.trim()
      );

      return buildDeviceListAnswer(
        missing,
        "Every device has a serial number saved.",
        "The following devices are missing serial numbers:"
      );
    }

    if (
      normalized.includes(
        "subscription"
      ) &&
      (
        normalized.includes("cost") ||
        normalized.includes("spend") ||
        normalized.includes("pay") ||
        normalized.includes(
          "monthly"
        )
      )
    ) {
      const monthly =
        subscriptions.reduce(
          (sum, subscription) =>
            sum +
            Number(
              subscription.monthly_cost ||
                0
            ),
          0
        );

      return `You currently track ${
        subscriptions.length
      } subscription${
        subscriptions.length === 1
          ? ""
          : "s"
      }. Their combined monthly cost is ${formatCurrency(
        monthly
      )}, or approximately ${formatCurrency(
        monthly * 12
      )} per year.`;
    }

    const matchedRoom =
      findRoomInQuestion(normalized);

    if (matchedRoom) {
      const roomDevices =
        devices.filter(
          (device) =>
            device.location
              ?.trim()
              .toLowerCase() ===
            matchedRoom.toLowerCase()
        );

      if (
        roomDevices.length === 0
      ) {
        return `I couldn’t find any devices assigned to ${matchedRoom}.`;
      }

      const value =
        roomDevices.reduce(
          (sum, device) =>
            sum +
            Number(
              device.purchase_price || 0
            ),
          0
        );

      const names = roomDevices
        .map(
          (device) =>
            `• ${
              device.device_name ||
              "Unnamed Device"
            }`
        )
        .join("\n");

      return `${matchedRoom} contains ${
        roomDevices.length
      } device${
        roomDevices.length === 1
          ? ""
          : "s"
      } with a combined recorded value of ${formatCurrency(
        value
      )}.\n\n${names}`;
    }

    const matchedBrand =
      findBrandInQuestion(normalized);

    if (matchedBrand) {
      const brandDevices =
        devices.filter(
          (device) =>
            device.brand
              ?.trim()
              .toLowerCase() ===
            matchedBrand.toLowerCase()
        );

      const value =
        brandDevices.reduce(
          (sum, device) =>
            sum +
            Number(
              device.purchase_price || 0
            ),
          0
        );

      return `You have ${
        brandDevices.length
      } ${matchedBrand} device${
        brandDevices.length === 1
          ? ""
          : "s"
      } with a combined recorded value of ${formatCurrency(
        value
      )}.`;
    }

    if (
      normalized.includes(
        "how many devices"
      ) ||
      normalized.includes(
        "device count"
      )
    ) {
      return `You currently have ${
        devices.length
      } device${
        devices.length === 1 ? "" : "s"
      } saved in your Home Tech Vault.`;
    }

    if (
      normalized.includes("rooms") ||
      normalized.includes("locations")
    ) {
      const roomCounts =
        new Map<string, number>();

      for (const device of devices) {
        const room =
          device.location?.trim() ||
          "Unassigned";

        roomCounts.set(
          room,
          (roomCounts.get(room) || 0) +
            1
        );
      }

      const list = Array.from(
        roomCounts.entries()
      )
        .sort(
          (first, second) =>
            second[1] - first[1]
        )
        .map(
          ([room, count]) =>
            `• ${room}: ${count} device${
              count === 1 ? "" : "s"
            }`
        )
        .join("\n");

      return `Your devices are organized across these rooms:\n\n${list}`;
    }

    return `I can currently answer questions about device values, rooms, brands, warranties, missing photos, missing documents, serial numbers, and subscription costs.

Try asking:
• Which warranty expires next?
• What is my most valuable device?
• Which devices are missing photos?
• How much technology is in my office?`;
  }

  function buildWarrantyAnswer() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const warranties = devices
      .filter(
        (device) =>
          Boolean(
            device.warranty_date
          )
      )
      .map((device) => {
        const expiration = new Date(
          `${device.warranty_date}T23:59:59`
        );

        const daysRemaining =
          Math.ceil(
            (expiration.getTime() -
              today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

        return {
          device,
          daysRemaining,
        };
      })
      .filter(
        (item) =>
          item.daysRemaining >= 0
      )
      .sort(
        (first, second) =>
          first.daysRemaining -
          second.daysRemaining
      );

    if (
      warranties.length === 0
    ) {
      return "You do not currently have any active warranty expiration dates saved.";
    }

    const soon = warranties.filter(
      (item) =>
        item.daysRemaining <= 60
    );

    const items = (
      soon.length > 0
        ? soon
        : warranties.slice(0, 3)
    )
      .slice(0, 5)
      .map(
        ({
          device,
          daysRemaining,
        }) =>
          `• ${
            device.device_name ||
            "Unnamed Device"
          } — ${
            daysRemaining === 0
              ? "expires today"
              : `${daysRemaining} day${
                  daysRemaining === 1
                    ? ""
                    : "s"
                } remaining`
          }`
      )
      .join("\n");

    return soon.length > 0
      ? `These warranties expire within the next 60 days:\n\n${items}`
      : `No warranties expire within the next 60 days. Your next warranty expirations are:\n\n${items}`;
  }

  function buildDeviceListAnswer(
    matchingDevices: Device[],
    emptyMessage: string,
    heading: string
  ) {
    if (
      matchingDevices.length === 0
    ) {
      return emptyMessage;
    }

    const list = matchingDevices
      .slice(0, 10)
      .map(
        (device) =>
          `• ${
            device.device_name ||
            "Unnamed Device"
          }${
            device.location
              ? ` — ${device.location}`
              : ""
          }`
      )
      .join("\n");

    const remaining =
      matchingDevices.length - 10;

    return `${heading}\n\n${list}${
      remaining > 0
        ? `\n\n…and ${remaining} more device${
            remaining === 1
              ? ""
              : "s"
          }.`
        : ""
    }`;
  }

  function findRoomInQuestion(
    question: string
  ) {
    const rooms = Array.from(
      new Set(
        devices
          .map((device) =>
            device.location?.trim()
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    );

    return rooms.find((room) =>
      question.includes(
        room.toLowerCase()
      )
    );
  }

  function findBrandInQuestion(
    question: string
  ) {
    const brands = Array.from(
      new Set(
        devices
          .map((device) =>
            device.brand?.trim()
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    );

    return brands.find((brand) =>
      question.includes(
        brand.toLowerCase()
      )
    );
  }

  function closePopup() {
    close();
  }

  function clearChat() {
    setMessages([
      welcomeMessage,
    ]);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadVaultData();
  }, [isOpen, loadVaultData]);

  // Hide the popup while Demo Mode is active,
  // when no authenticated user exists,
  // or when AI Advisor is not on the effective plan.
  if (
    permissionsLoading ||
    isDemo ||
    !user ||
    !canViewFeature("aiAdvisor")
  ) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <section className="fixed bottom-5 right-5 z-[9999] flex h-[min(680px,calc(100vh-40px))] w-[calc(100vw-40px)] max-w-md flex-col overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card shadow-lg">
          <header className="flex items-center justify-between border-b border-border-subtle bg-gradient-to-r from-section-insights-soft to-surface-card px-5 py-4 text-text-primary">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Bot
                  size={21}
                  className="text-white"
                />
              </div>

              <div>
                <h2 className="font-bold">
                  AI Advisor
                </h2>

                <p className="text-xs text-text-secondary">
                  Connected to your vault
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat"
                className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-white"
              >
                <FileQuestion
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={closePopup}
                aria-label="Close AI Advisor"
                className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-surface-base p-4">
            <div className="space-y-4">
              {messages.map(
                (chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`flex ${
                      chatMessage.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                        chatMessage.role ===
                        "user"
                          ? "rounded-br-md bg-charcoal text-surface-card"
                          : "rounded-bl-md border border-border-subtle bg-white text-text-secondary"
                      }`}
                    >
                      {
                        chatMessage.content
                      }
                    </div>
                  </div>
                )
              )}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border-subtle bg-white px-4 py-3 text-sm text-text-secondary">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Analyzing your vault...
                  </div>
                </div>
              )}

              <div
                ref={messagesEndRef}
              />
            </div>

            {messages.length === 1 && (
              <div className="mt-6">
                <p className="mb-3 text-overline text-charcoal-soft">
                  Try asking
                </p>

                <div className="space-y-2">
                  {starterQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          submitMessage(
                            undefined,
                            question
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-white p-3 text-left text-sm text-text-primary transition hover:border-border-strong hover:shadow-sm"
                      >
                        <MessageCircle
                          size={16}
                          className="shrink-0 text-interaction"
                        />

                        {question}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={submitMessage}
            className="border-t border-border-subtle bg-white p-4"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
                placeholder="Ask about your technology..."
                rows={1}
                className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-primary outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/20"
              />

              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  sending
                }
                aria-label="Send message"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-surface-card transition hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-text-tertiary">
              Answers are generated from your saved vault information.
            </p>
          </form>
      </section>
    </>
  );
}

function formatCurrency(
  value?: number | null
) {
  return Number(
    value || 0
  ).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}