import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Wrench } from "lucide-react-native";
import { Card, ListRow, SecondaryButton, SectionTitle } from "./ui";
import { listIssues, removeIssue } from "@/lib/troubleshooting-history";
import type { SavedIssue } from "@/lib/troubleshooting-contract";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/theme";
export function IssueHistory({ deviceId }: { deviceId?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<SavedIssue[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(() => {
    let active = true;
    if (!auth.user || auth.isDemo) {
      setIssues([]);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    void listIssues(auth.user.id, deviceId)
      .then((rows) => {
        if (active) {
          setIssues(rows);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth.user, auth.isDemo, deviceId]);
  useFocusEffect(load);
  function deleteIssue(issue: SavedIssue) {
    Alert.alert(
      "Delete saved issue?",
      "This removes the description and resolution from your vault.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (!auth.user) return;
            void removeIssue(issue.id, auth.user.id)
              .then(() =>
                setIssues((rows) => rows.filter((row) => row.id !== issue.id)),
              )
              .catch((e) => setError(e.message));
          },
        },
      ],
    );
  }
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle title="Troubleshooting history" />
      {loading ? (
        <Text style={{ color: colors.muted }}>Loading issues…</Text>
      ) : null}
      {error ? (
        <>
          <Text accessibilityRole="alert" style={{ color: colors.rust }}>
            {error}
          </Text>
          <SecondaryButton
            label="Retry history"
            onPress={() => {
              load();
            }}
          />
        </>
      ) : null}
      {!loading && !error && !issues.length ? (
        <Text style={{ color: colors.muted }}>
          No saved issues yet. Save an issue after troubleshooting to remember
          what helped.
        </Text>
      ) : null}
      {issues.map((issue) => (
        <Card key={issue.id}>
          <ListRow
            icon={Wrench}
            title={issue.description}
            detail={`${issue.status === "resolved" ? "Resolved" : "Open"} · ${new Date(issue.created_at).toLocaleDateString()}\n${issue.ai_summary}${issue.resolution ? `\n${issue.resolution}` : ""}`}
            onPress={() =>
              router.push({
                pathname: "/ask-my-home",
                params: {
                  mode: "troubleshooting",
                  deviceId: issue.device_id || "",
                  issueId: issue.id,
                  description: issue.description,
                  category: issue.category,
                },
              })
            }
          />
          <SecondaryButton
            label="Delete issue"
            onPress={() => deleteIssue(issue)}
          />
        </Card>
      ))}
    </View>
  );
}
