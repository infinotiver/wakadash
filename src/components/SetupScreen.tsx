import React, { useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useColors } from "@/src/hooks/useColors";
import {
  wakatimeApi,
  WakaTimeApiError,
  DEFAULT_BASE_URL,
  isHackatime,
} from "@/src/api/wakatime";
import { ct } from "@/src/constants/styles.common";
import { SegmentedButtons } from "@/src/components/SegmentedButtons";
import { Button } from "./Button";
import { useWakaTimeOAuth } from "../api/wakatimeOAuth";
import type { WakaTimeOAuthTokens } from "../api/wakatimeOAuth";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const HACKATIME_URL = "https://hackatime.hackclub.com/api/hackatime/v1";
const LOGO_SIZE = 56;
const ICON_HIT_SLOP = { top: 16, bottom: 16, left: 4, right: 4 } as const;

type ProviderMode = "wakatime" | "hackatime" | "custom";

const PROVIDER_OPTIONS: { label: string; value: ProviderMode }[] = [
  { label: "WakaTime", value: "wakatime" },
  { label: "Hackatime", value: "hackatime" },
  { label: "Custom", value: "custom" },
];

const PROVIDER_URL = {
  wakatime: DEFAULT_BASE_URL,
  hackatime: HACKATIME_URL,
} as const;

const cleanUrl = (url: string) => url.trim().replace(/\/+$/, "");

function getInitialMode(url: string): ProviderMode {
  const clean = cleanUrl(url);
  if (!clean || clean === DEFAULT_BASE_URL) return "wakatime";
  return clean === HACKATIME_URL ? "hackatime" : "custom";
}

type MaterialCommunityIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

interface FieldProps extends TextInputProps {
  icon?: MaterialCommunityIconName;
  invalid?: boolean;
  right?: React.ReactNode;
  inputRef?: React.Ref<TextInput>;
}

// Bordered input row: optional leading icon, optional trailing actions.
function Field({ icon, invalid, right, inputRef, ...input }: FieldProps) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: ct.space.sm,
        height: 48,
        paddingHorizontal: ct.space.md,
        borderWidth: 1,
        borderRadius: ct.radius.lg,
        borderColor: invalid ? colors.error : colors.outline,
        backgroundColor: colors.surfaceContainerHighest,
      }}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={colors.onSurfaceVariant}
        />
      ) : null}
      <TextInput
        ref={inputRef}
        style={{
          flex: 1,
          height: "100%",
          paddingVertical: 0,
          fontSize: ct.fontSize.md,
          fontFamily: ct.fontFamily.regular,
          color: colors.onSurface,
        }}
        placeholderTextColor={colors.onSurfaceVariant}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        {...input}
      />
      {right}
    </View>
  );
}

function IconAction({
  name,
  label,
  onPress,
}: {
  name: MaterialCommunityIconName;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={ICON_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons
        name={name}
        size={16}
        color={colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
}

export function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    setApiKey,
    setOAuthTokens,
    baseUrl: savedBaseUrl,
    setBaseUrl,
  } = useWakaTime();
  const keyRef = useRef<TextInput>(null);

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
    providerMode === "custom"
      ? cleanUrl(customUrl)
      : PROVIDER_URL[providerMode];
  const urlValid = /^https?:\/\/.+/.test(activeServerUrl);
  const canSubmit = key.trim().length > 0 && urlValid && !loading;

  const keyPortalUrl = isHackatime(activeServerUrl)
    ? "https://hackatime.hackclub.com"
    : "https://wakatime.com/oauth";

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
      } else if (e instanceof WakaTimeApiError) {
        setError(e.message);
      } else {
        // fetch failures are plain TypeErrors ("Network request failed")
        setError("Couldn't reach the server. Check the URL and your network.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!canSubmit) return; // also guards the keyboard's Done key
    await connect(key.trim(), activeServerUrl);
  }

  async function connectOAuth(tokens: WakaTimeOAuthTokens) {
    setLoading(true);
    setError(null);
    try {
      await wakatimeApi.verifyKey(tokens.accessToken, DEFAULT_BASE_URL);
      await setBaseUrl(DEFAULT_BASE_URL);
      await setOAuthTokens(tokens);
    } catch (e: unknown) {
      if (e instanceof WakaTimeApiError) setError(e.message);
      else setError("Couldn't complete WakaTime sign-in.");
    } finally {
      setLoading(false);
    }
  }

  const { signIn, ready } = useWakaTimeOAuth(
    (tokens) => connectOAuth(tokens),
    (oauthError) => setError(oauthError.message),
  );

  return (
     <KeyboardAwareScrollView
    style={{ flex: 1, backgroundColor: colors.background }}
    keyboardShouldPersistTaps="handled"
    bounces={false}
    bottomOffset={ct.space.xl} // gap kept between the focused field and the keyboard
    contentContainerStyle={{
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingTop: insets.top + ct.space.xl,
    }}
  >
        {/* Parent sheet: logo + both cards */}
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
            backgroundColor: colors.surfaceContainerLow,
            borderTopLeftRadius: ct.radius["3xl"],
            borderTopRightRadius: ct.radius["3xl"],
            paddingTop: ct.space["2xl"],
            paddingHorizontal: ct.space.lg,
            paddingBottom: insets.bottom + ct.space.lg,
            gap: ct.space.lg,
          }}
        >
          {/* Logo + title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ct.space.md,
            }}
          >
            <Image
              source={require("/assets/icons/icon.png")}
              style={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                borderRadius: ct.radius.lg,
              }}
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
              <Field
                icon="web"
                value={customUrl}
                onChangeText={(v) => {
                  setCustomUrl(v);
                  setError(null);
                }}
                placeholder="https://wakapi.dev/api/compat/wakatime/v1"
                keyboardType="url"
                returnKeyType="next"
                onSubmitEditing={() => keyRef.current?.focus()}
                invalid={customUrl.length > 0 && !urlValid}
                right={
                  customUrl.length > 0 ? (
                    <IconAction
                      name="close"
                      label="Clear custom URL"
                      onPress={() => setCustomUrl("")}
                    />
                  ) : null
                }
              />
            )}
          </View>

          {/* Sign in + API key */}
          <View style={cardStyle}>
            {providerMode === "wakatime" && (
              <>
                <Button
                  onPress={signIn}
                  disabled={!ready || loading}
                  loading={loading}
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

            <Field
              inputRef={keyRef}
              value={key}
              onChangeText={(v) => {
                setKey(v);
                setError(null);
              }}
              placeholder={
                providerMode === "wakatime" ? "waka_tok_..." : "waka_..."
              }
              secureTextEntry={!show}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              invalid={!!error}
              right={
                <>
                  {providerMode !== "custom" && (
                    <IconAction
                      name="open-in-new"
                      label="Get a key"
                      onPress={() => Linking.openURL(keyPortalUrl)}
                    />
                  )}
                  <IconAction
                    name={show ? "eye-off" : "eye"}
                    label={show ? "Hide key" : "Show key"}
                    onPress={() => setShow((s) => !s)}
                  />
                </>
              }
            />

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
              <MaterialCommunityIcons
                name="alert-circle-outline"
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
        </View>
      </KeyboardAwareScrollView>
  );
}
