import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { ct } from "@/src/constants/styles.common";

const SUCCESS_MS = 1200; // long enough to read two words
const FAIL_MS = 2000;
const TIMEOUT_MS = 8000; // give up if the token never gets stored

type Status = "connecting" | "success" | "failed";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isConfigured } = useWakaTime();
  const { error } = useLocalSearchParams<{ error?: string }>();
  const [status, setStatus] = useState<Status>(error ? "failed" : "connecting");

  // token verified and stored
  useEffect(() => {
    if (isConfigured) setStatus("success");
  }, [isConfigured]);

  // nothing happened
  useEffect(() => {
    if (status !== "connecting") return;
    const t = setTimeout(() => setStatus("failed"), TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [status]);

  // leave once the result has been readable
  useEffect(() => {
    if (status === "connecting") return;
    const t = setTimeout(
      () => router.replace("/"),
      status === "success" ? SUCCESS_MS : FAIL_MS,
    );
    return () => clearTimeout(t);
  }, [status, router]);

  const failed = status === "failed";
  const message =
    status === "connecting"
      ? "Signing in…"
      : status === "success"
        ? "Signed in"
        : error === "access_denied"
          ? "Sign-in cancelled"
          : "Sign-in failed";

  return (
    <View
      style={[
        ct.styles.flex,
        ct.styles.center,
        { backgroundColor: colors.background, gap: ct.space.lg },
      ]}
    >
      {status === "connecting" ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View
          style={{
            width: ct.size.avatar,
            height: ct.size.avatar,
            borderRadius: ct.radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: failed
              ? colors.errorContainer
              : colors.accent.green.colorContainer,
          }}
        >
          <MaterialCommunityIcons
            name={failed ? "close" : "check"}
            size={32}
            color={
              failed
                ? colors.onErrorContainer
                : colors.accent.green.onColorContainer
            }
          />
        </View>
      )}
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontSize: ct.fontSize.title,
          fontFamily: ct.fontFamily.semibold,
          color: colors.onSurface,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
