import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useColors } from "@/src/hooks/useColors";
import {
  commonStyles,
  t,
  SPACING,
  RADIUS,
  FONT_SIZES,
} from "@/src/constants/styles.common";

export function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setApiKey } = useWakaTime();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const encoded =
        typeof btoa !== "undefined"
          ? btoa(trimmed + ":")
          : Buffer.from(trimmed + ":").toString("base64");
      const res = await fetch("https://api.wakatime.com/api/v1/users/current", {
        headers: { Authorization: `Basic ${encoded}` },
      });
      if (res.status === 401) throw new Error("Invalid API key.");
      if (!res.ok) throw new Error("Could not verify. Try again.");
      await setApiKey(trimmed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = key.trim().length > 0 && !loading;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === "web" ? 80 : insets.top + 32,
        paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 32,
        paddingHorizontal: SPACING.xl + 4,
      }}
    >
      {/* Top wordmark */}
      <View style={{ flex: 1, justifyContent: "center", gap: SPACING.xxl }}>
        <View style={{ gap: SPACING.sm }}>
          <Text
            style={{
              fontSize: FONT_SIZES["8xl"],
              fontFamily: "Inter_700Bold",
              letterSpacing: -1.5,
              color: colors.foreground,
              lineHeight: FONT_SIZES["8xl"] * 1.1,
            }}
          >
            WakaDash
          </Text>
          <Text style={[t.body, { color: colors.mutedForeground }]}>
            Paste your API key to get started.
          </Text>
        </View>

        <View style={{ gap: SPACING.md }}>
          {/* Key input */}
          <View
            style={{
              borderWidth: 1,
              borderColor: error ? colors.destructive : colors.border,
              borderRadius: RADIUS.lg,
              backgroundColor: colors.card,
              flexDirection: "row",
              alignItems: "center",
              height: 52,
              paddingHorizontal: SPACING.lg,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: FONT_SIZES.md,
                fontFamily: "Inter_400Regular",
                color: colors.foreground,
                height: "100%",
              }}
              placeholder="waka_xxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.mutedForeground}
              value={key}
              onChangeText={(v) => {
                setKey(v);
                setError(null);
              }}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <TouchableOpacity
              onPress={() => setShow((s) => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={show ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <Text
              style={[
                t.caption,
                { color: colors.destructive, paddingHorizontal: 2 },
              ]}
            >
              {error}
            </Text>
          )}

          {/* Connect button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={{
              height: 52,
              borderRadius: RADIUS.lg,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: canSubmit ? 1 : 0.4,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={{
                  fontSize: FONT_SIZES.lg,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.primaryForeground,
                }}
              >
                Connect
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer hint */}
        <Text
          style={[
            t.caption,
            {
              color: colors.mutedForeground,
              textAlign: "center",
              lineHeight: 18,
            },
          ]}
        >
          Find your key at{" "}
          <Text style={{ color: colors.primary }}>
            wakatime.com/settings/api-key
          </Text>
        </Text>
      </View>
    </View>
  );
}
