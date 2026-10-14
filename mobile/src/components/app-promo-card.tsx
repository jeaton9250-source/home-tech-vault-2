import {
  PromoCard,
  type PromoCardData,
  type CrossPromoPlacement,
} from "@crosspromo/react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { Card, PrimaryButton, SecondaryButton } from "./ui";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";

/** Recommendations stay optional; no SDK fetch runs until the user opts in. */
export function AppPromoCard({
  placement,
}: {
  placement: CrossPromoPlacement;
}) {
  const auth = useAuth();
  return (
    <PromoSession key={auth.user?.id || auth.mode} placement={placement} />
  );
}
function PromoSession({ placement }: { placement: CrossPromoPlacement }) {
  const router = useRouter();
  const auth = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [card, setCard] = useState<PromoCardData | null>(null);
  const [about, setAbout] = useState(false);
  if (hidden) return null;
  function report() {
    const subject = "Report an app recommendation";
    const message = `Please review this ad: ${card?.appName || "Unknown app"}\nPlacement: ${placement}\n${card?.tagline || ""}\nReason: `;
    if (auth.session)
      router.push({
        pathname: "/feedback",
        params: { kind: "issue", subject, message },
      });
    else
      void Linking.openURL(
        `mailto:support@hometechvault.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
      ).catch(() =>
        Alert.alert(
          "Contact support",
          "Email support@hometechvault.com to report this ad.",
        ),
      );
  }
  return (
    <View style={{ gap: 8 }}>
      {enabled ? (
        <>
          <PromoCard placement={placement} onLoaded={setCard} />
          {card ? (
            <>
              <SecondaryButton
                label="About this ad"
                onPress={() => setAbout((value) => !value)}
              />
              {about ? (
                <Text style={{ color: colors.muted }}>
                  This recommendation is shown for Home Tech Vault’s {placement}{" "}
                  placement. CrossPromo receives app/platform/version details
                  and app-integrity verification, and records anonymous ad
                  impressions and clicks. HTV does not send your vault records
                  to CrossPromo.
                </Text>
              ) : null}
              <SecondaryButton label="Report ad" onPress={report} />
            </>
          ) : null}
          <SecondaryButton
            label="Hide recommendations"
            onPress={() => {
              setEnabled(false);
              setHidden(true);
            }}
          />
        </>
      ) : (
        <Card style={{ padding: 16, gap: 10 }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>
            Optional app recommendations
          </Text>
          <Text style={{ color: colors.muted }}>
            Show third-party ads from CrossPromo? It receives
            app/platform/version details and integrity verification, and records
            anonymous impressions and clicks. Your home records are not shared.
            This is optional and can be hidden.
          </Text>
          <PrimaryButton
            label="Show recommendations"
            onPress={() => setEnabled(true)}
          />
          <SecondaryButton label="No thanks" onPress={() => setHidden(true)} />
        </Card>
      )}
    </View>
  );
}
