import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useColors } from "@/src/hooks/useColors";

export function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setApiKey } = useWakaTime();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  function getVerifyUrl(): string {
    if (Platform.OS !== "web") {
      return "https://api.wakatime.com/api/v1/users/current";
    }
    // On web, route through the shared proxy to avoid CORS.
    // Expo dev runs on expo.<host>; the proxy lives at <host>.
    const host =
      typeof window !== "undefined"
        ? window.location.host.replace(/^expo\./, "")
        : (process.env.EXPO_PUBLIC_DOMAIN ?? "");
    const proto =
      typeof window !== "undefined" ? window.location.protocol : "https:";
    return `${proto}//${host}/api/wakatime/users/current`;
  }

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const encoded =
        typeof btoa !== "undefined"
          ? btoa(trimmed)
          : Buffer.from(trimmed).toString("base64");
      const res = await fetch(getVerifyUrl(), {
        headers: { Authorization: `Basic ${encoded}` },
      });
      if (res.status === 401)
        throw new Error("Invalid API key. Check and try again.");
      if (!res.ok) throw new Error("Could not verify key. Try again.");
      await setApiKey(trimmed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 24,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather name="clock" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>WakaTime</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Enter your WakaTime API key to get started. Find it at{" "}
        <Text style={{ color: colors.primary }}>
          wakatime.com/settings/api-key
        </Text>
      </Text>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground, fontFamily: "Inter_400Regular" },
          ]}
          placeholder="waka_..."
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
          style={styles.eyeBtn}
        >
          <Feather
            name={show ? "eye-off" : "eye"}
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: loading || !key.trim() ? 0.5 : 1,
          },
        ]}
        onPress={handleSave}
        disabled={loading || !key.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text
            style={[styles.buttonText, { color: colors.primaryForeground }]}
          >
            Connect
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 16,
  },
  iconWrap: {
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -1,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  button: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
