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
import { wakatimeApi } from "@/src/api/wakatime";
import { ct } from "@/src/constants/styles.common";

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
      await wakatimeApi.verifyKey(trimmed);
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
        paddingHorizontal: ct.xl + 4,
      }}
    >
      {/* Top wordmark */}
      <View style={{ flex: 1, justifyContent: "center", gap: ct.padding["2xl"] }}>
        <View style={{ gap: ct.sm }}>
          <Text
            style={{
              fontSize: ct.fontSize["8xl"],
              fontFamily: ct.fontFamily.bold,
              color: colors.foreground,
              textAlign: "center",
              lineHeight: ct.fontSize["8xl"],
            }}
          >
            WakaDash
          </Text>
          <Text
            style={[
              ct.text.body,
              { color: colors.mutedForeground, textAlign: "center" },
            ]}
          >
            Paste your API key to get started.
          </Text>
        </View>

        <View style={{ gap: ct.md }}>
          {/* Key input */}
          <View
            style={{
              borderWidth: 1,
              borderColor: error ? colors.destructive : colors.border,
              borderRadius: ct.radius.lg,
              backgroundColor: colors.card,
              flexDirection: "row",
              alignItems: "center",
              height: 52,
              paddingHorizontal: ct.lg,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.regular,
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
                ct.text.caption,
                { color: colors.destructive, paddingHorizontal: ct.layout.inputErrorPadding },
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
              padding: ct.padding.lg,
              borderRadius: ct.radius.lg,
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
                  fontSize: ct.fontSize.lg,
                  fontFamily: ct.fontFamily.semibold,
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
            ct.text.caption,
            {
              color: colors.mutedForeground,
              textAlign: "center",
              lineHeight: ct.lineHeight.sm,
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
