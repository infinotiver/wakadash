import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
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
import { useWakaTimeOAuth } from "@/src/api/wakatimeOAuth";
import { ct } from "@/src/constants/styles.common";
import { SegmentedButtons } from "@/src/components/SegmentedButtons";
import { Button } from "./Button";

const HACKATIME_URL = "https://hackatime.hackclub.com/api/hackatime/v1";
const LOGO_SIZE = 72;

const ICON_HIT_SLOP = { top: 16, bottom: 16, left: 4, right: 4 } as const;

type ProviderMode = "wakatime" | "hackatime" | "custom";

const PROVIDER_OPTIONS: { label: string; value: ProviderMode }[] = [
  { label: "WakaTime", value: "wakatime" },
  { label: "Hackatime", value: "hackatime" },
  { label: "Custom", value: "custom" },
];

function getInitialMode(url: string): ProviderMode {
  const clean = url.trim().replace(/\/+$/, "");
  if (!clean || clean === DEFAULT_BASE_URL) return "wakatime";
  if (clean === HACKATIME_URL) return "hackatime";
  return "custom";
}

export function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setApiKey, baseUrl: savedBaseUrl, setBaseUrl } = useWakaTime();

  const initialUrl = savedBaseUrl || DEFAULT_BASE_URL;
  const [providerMode, setProviderMode] = useState<ProviderMode>(() =>
    getInitialMode(initialUrl),
  );
  const [customUrl, setCustomUrl] = useState(() =>
    getInitialMode(initialUrl) === "custom" ? initialUrl : "",
  );
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const activeServerUrl =
    providerMode === "wakatime"
      ? DEFAULT_BASE_URL
      : providerMode === "hackatime"
        ? HACKATIME_URL
        : customUrl.trim().replace(/\/+$/, "");

  const isHackatime =
    providerMode === "hackatime" ||
    activeServerUrl.includes("hackatime.hackclub.com");

  const keyPortalUrl = isHackatime
    ? "https://hackatime.hackclub.com"
    : "https://wakatime.com/oauth";

  const fieldStyle = {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: ct.radius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    height: 48,
    paddingHorizontal: ct.space.md,
    fontSize: ct.fontSize.md,
    fontFamily: ct.fontFamily.regular,
    color: colors.onSurface,
  } as const;

  const cardStyle = {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: ct.radius["2xl"],
    padding: ct.space.lg,
    gap: ct.space.md,
  } as const;

  async function connect(credential: string, url: string) {
    setLoading(true);
    setError(null);
    try {
      await wakatimeApi.verifyKey(credential, url);
      await setBaseUrl(url);
      await setApiKey(credential);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "Invalid API key") {
        setError("Invalid key or token.");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Could not connect to server. Check your URL and network.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const trimmedKey = key.trim();
    const trimmedUrl = activeServerUrl;
    if (!trimmedKey) return;

    if (!/^https?:\/\/.+/.test(trimmedUrl)) {
      setError("Enter a valid URL starting with http:// or https://");
      return;
    }

    await connect(trimmedKey, trimmedUrl);
  }

  const { signIn, ready } = useWakaTimeOAuth((token) =>
    connect(token, DEFAULT_BASE_URL),
  );

  const hasValidProvider =
    providerMode !== "custom" || customUrl.trim().length > 0;
  const canSubmit = key.trim().length > 0 && hasValidProvider && !loading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={ct.styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Platform.OS === "web" ? 48 : insets.top + ct.space.xl,
          paddingBottom: insets.bottom + ct.space["2xl"],
          paddingHorizontal: ct.space.lg,
          gap: ct.space.lg,
          maxWidth: 480,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* Logo + title */}
        <View style={{ alignItems: "flex-start", gap: ct.space.md }}>
          <Image
            source={require("/assets/icons/icon.png")}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text
            accessibilityRole="header"
            style={{
              fontSize: ct.fontSize.display,
              fontFamily: ct.fontFamily.bold,
              color: colors.onSurface,
            }}
          >
            WakaDash
          </Text>
        </View>

        {/* Provider */}
        <View style={cardStyle}>
          <SegmentedButtons
            items={PROVIDER_OPTIONS}
            value={providerMode}
            onChange={(mode) => {
              setProviderMode(mode as ProviderMode);
              setError(null);
            }}
          />

          {providerMode === "custom" && (
            <View
              style={{
                ...fieldStyle,
                flexDirection: "row",
                alignItems: "center",
                gap: ct.space.sm,
              }}
            >
              <Feather name="globe" size={16} color={colors.onSurfaceVariant} />
              <TextInput
                style={{
                  flex: 1,
                  height: "100%",
                  paddingVertical: 0,
                  fontSize: fieldStyle.fontSize,
                  fontFamily: fieldStyle.fontFamily,
                  color: fieldStyle.color,
                }}
                value={customUrl}
                onChangeText={(v) => {
                  setCustomUrl(v);
                  setError(null);
                }}
                placeholder="https://wakapi.dev/api/compat/wakatime/v1"
                placeholderTextColor={colors.onSurfaceVariant}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {customUrl.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCustomUrl("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear custom URL"
                >
                  <Feather name="x" size={15} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Sign in + API key */}
        <View style={cardStyle}>
          {providerMode === "wakatime" && (
            <>
              <Button
                onPress={signIn}
                disabled={!ready || loading}
                label="Sign in with WakaTime"
              />
              <View
                style={[
                  ct.styles.divider,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />
            </>
          )}

          <View
            style={{
              ...fieldStyle,
              flexDirection: "row",
              alignItems: "center",
              gap: ct.space.sm,
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
              placeholder={
                providerMode === "wakatime" ? "waka_tok_..." : "waka_..."
              }
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
            {providerMode !== "custom" && (
              <TouchableOpacity
                onPress={() => Linking.openURL(keyPortalUrl)}
                hitSlop={ICON_HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel="Get a key"
              >
                <Feather
                  name="external-link"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShow((s) => !s)}
              hitSlop={ICON_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={show ? "Hide key" : "Show key"}
            >
              <Feather
                name={show ? "eye-off" : "eye"}
                size={16}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleSave}
            disabled={!canSubmit}
            label="Connect"
            loading={loading}
          />
        </View>

        {error && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ct.space.sm,
              backgroundColor: colors.errorContainer,
              padding: ct.space.md,
              borderRadius: ct.radius.lg,
            }}
          >
            <Feather
              name="alert-circle"
              size={16}
              color={colors.onErrorContainer}
            />
            <Text
              style={[
                ct.text.caption,
                { color: colors.onErrorContainer, flex: 1 },
              ]}
            >
              {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
