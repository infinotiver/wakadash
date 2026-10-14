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
import { SegmentedButtons } from "@/src/components/SegmentedButtons";

const SERVER_SUGGESTIONS = [
  { label: "WakaTime", value: DEFAULT_BASE_URL },
  {
    label: "Hackatime",
    value: "https://hackatime.hackclub.com/api/hackatime/v1",
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
  const normalizedServerUrl = serverUrl.trim().replace(/\/+$/, "");
  const fieldStyle = {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: ct.radius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    height: 52,
    paddingHorizontal: ct.space.lg,
    fontSize: ct.fontSize.md,
    fontFamily: ct.fontFamily.regular,
    color: colors.onSurface,
  } as const;

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
        paddingHorizontal: ct.space["2xl"],
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          gap: ct.padding["2xl"],
          maxWidth: 480,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <View style={{ gap: ct.space.md }}>
          <Text
            style={{
              fontSize: ct.fontSize.display,
              fontFamily: ct.fontFamily.bold,
              color: colors.onSurface,
              textAlign: "center",
              lineHeight: ct.lineHeight.xl,
            }}
          >
            WakaDash
          </Text>
        </View>

        <View style={{ gap: ct.space.xl }}>
          {/* Server selector */}
          <View style={{ gap: ct.space.md }}>
            <Text
              style={{
                color: colors.onSurface,
                fontFamily: ct.fontFamily.semibold,
                fontSize: ct.fontSize.md,
                textAlign: "center",
              }}
            >
              Choose your provider
            </Text>
            <SegmentedButtons
              items={SERVER_SUGGESTIONS}
              value={normalizedServerUrl}
              onChange={(url) => {
                setServerUrl(url);
                setError(null);
              }}
            />
            <TextInput
              style={fieldStyle}
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
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: ct.fontFamily.regular,
                fontSize: ct.fontSize.xs,
                paddingHorizontal: ct.space.xs,
              }}
            >
              Or enter a compatible server URL.
            </Text>
          </View>

          {/* Key input */}
          <Text
            style={{
              color: colors.onSurface,
              fontFamily: ct.fontFamily.semibold,
              fontSize: ct.fontSize.md,
              marginBottom: -ct.space.xs,
            }}
          >
            API key
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              ...fieldStyle,
              borderColor: error ? colors.error : colors.outline,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                height: "100%",
                paddingVertical: 0,
                fontSize: fieldStyle.fontSize,
                fontFamily: fieldStyle.fontFamily,
                color: fieldStyle.color,
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
              accessibilityRole="button"
              accessibilityLabel={show ? "Hide API key" : "Show API key"}
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
                  paddingHorizontal: ct.space.sm,
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
            accessibilityRole="button"
            accessibilityLabel="Connect WakaDash"
            style={{
              minHeight: 52,
              paddingHorizontal: ct.padding.lg,
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
                Connect WakaDash
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
