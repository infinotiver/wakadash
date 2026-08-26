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
import { wakatimeApi, DEFAULT_BASE_URL } from "@/src/api/wakatime";
import { ct } from "@/src/constants/styles.common";

const SERVER_SUGGESTIONS = [
  { label: "WakaTime", url: DEFAULT_BASE_URL },
  {
    label: "Hackatime",
    url: "https://hackatime.hackclub.com/api/hackatime/v1",
  },
];

export function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setApiKey, baseUrl: savedBaseUrl, setBaseUrl } = useWakaTime();

  const [key, setKey] = useState("");
  const [serverUrl, setServerUrl] = useState(savedBaseUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const isHackatime = serverUrl.includes("hackatime.hackclub.com");

  async function handleSave() {
    const trimmedKey = key.trim();
    const trimmedUrl = serverUrl.trim().replace(/\/+$/, "") || DEFAULT_BASE_URL;
    if (!trimmedKey) return;

    setLoading(true);
    setError(null);
    try {
      await wakatimeApi.verifyKey(trimmedKey, trimmedUrl);
      await setBaseUrl(trimmedUrl);
      await setApiKey(trimmedKey);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "Invalid API key") {
        setError("Invalid key — check it and try again.");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Something went wrong.");
      }
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
      <View
        style={{ flex: 1, justifyContent: "center", gap: ct.padding["2xl"] }}
      >
        <View style={{ gap: ct.sm }}>
          <Text
            style={{
              fontSize: ct.fontSize["8xl"],
              fontFamily: ct.fontFamily.bold,
              color: colors.onSurface,
              textAlign: "center",
              lineHeight: ct.fontSize["8xl"],
            }}
          >
            WakaDash
          </Text>
          <Text
            style={[
              ct.text.body,
              { color: colors.onSurfaceVariant, textAlign: "center" },
            ]}
          >
            Paste your API key & choose your provider (You can change them
            later).
          </Text>
        </View>

        <View style={{ gap: ct.md }}>
          {/* Server selector */}
          <View style={{ gap: ct.xs }}>
            <View style={{ flexDirection: "row", gap: ct.xs }}>
              {SERVER_SUGGESTIONS.map((s) => {
                const selected = serverUrl.trim().replace(/\/+$/, "") === s.url;
                return (
                  <TouchableOpacity
                    key={s.url}
                    onPress={() => {
                      setServerUrl(s.url);
                      setError(null);
                    }}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      padding: ct.md,
                      borderRadius: ct.radius.full,
                      borderWidth: 1,
                      borderColor: selected
                        ? colors.outline
                        : colors.outlineVariant,
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surfaceContainerHighest,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: ct.fontSize.sm,
                        fontFamily: ct.fontFamily.medium,
                        color: selected
                          ? colors.onPrimary
                          : colors.onSurfaceVariant,
                      }}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={{
                fontSize: ct.fontSize.sm,
                fontFamily: ct.fontFamily.regular,
                color: colors.onSurfaceVariant,
                paddingHorizontal: ct.layout.inputErrorPadding,
              }}
              value={serverUrl}
              onChangeText={(v) => {
                setServerUrl(v);
                setError(null);
              }}
              placeholder={DEFAULT_BASE_URL}
              placeholderTextColor={colors.onSurfaceVariant}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {/* Key input */}
          <View
            style={{
              borderWidth: 1,
              borderColor: error ? colors.error : colors.outline,
              borderRadius: ct.radius.lg,
              backgroundColor: colors.surfaceContainerHighest,
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
                color: colors.onSurface,
                height: "100%",
              }}
              placeholder="xxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.onSurfaceVariant}
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
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <Text
              style={[
                ct.text.caption,
                {
                  color: colors.error,
                  paddingHorizontal: ct.layout.inputErrorPadding,
                },
              ]}
            >
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={{
              padding: ct.padding.md,
              borderRadius: ct.radius.full,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: canSubmit ? 1 : 0.4,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text
                style={{
                  fontSize: ct.fontSize.lg,
                  fontFamily: ct.fontFamily.semibold,
                  color: colors.onPrimary,
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
              color: colors.onSurfaceVariant,
              textAlign: "center",
              lineHeight: ct.lineHeight.sm,
            },
          ]}
        >
          Find your key at{" "}
          <Text style={{ color: colors.primary }}>
            {isHackatime
              ? "hackatime.hackclub.com"
              : "wakatime.com/settings/api-key"}
          </Text>
        </Text>
      </View>
    </View>
  );
}
