import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Linking,
} from "react-native";


import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaUser } from "@/src/hooks/useWakaTimeQueries";
import { wakatimeApi } from "@/src/api/wakatime";
import type { WakaUser } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import { AppBar } from "@/src/components/AppBar";
const styles = ct.styles.settings;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured, apiKey, setApiKey, clearApiKey } = useWakaTime();

  const [editing, setEditing] = useState(!isConfigured);
  const [newKey, setNewKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const userQ = useWakaUser();

  useEffect(() => {
    if (!isConfigured) setEditing(true);
  }, [isConfigured]);

  async function handleSave() {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await wakatimeApi.verifyKey(trimmed);
      await setApiKey(trimmed);
      setEditing(false);
      setNewKey("");
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid API key") {
        Alert.alert("Invalid key", "Check your API key and try again.");
      } else {
        Alert.alert("Error", "Could not verify key. Check your connection.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    Alert.alert(
      "Remove API key?",
      "You'll need to re-enter it to use the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            clearApiKey();
            setEditing(true);
          },
        },
      ],
    );
  }

  const user = userQ.data as WakaUser | undefined;
  const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="Settings" variant="center" />
      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + ct.lg },
        ]}
      >
        {userQ.isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: ct.layout.loadingCompact }}
          />
        ) : user ? (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surfaceContainerHigh,
              },
            ]}
          >
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="user" size={28} color={colors.onPrimary} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: colors.onSurface }]}>
                {user.display_name || user.username}
              </Text>
              <Text
                style={[styles.username, { color: colors.onSurfaceVariant }]}
              >
                @{user.username}
              </Text>
              {user.location ? (
                <View style={styles.locationRow}>
                  <Feather
                    name="map-pin"
                    size={12}
                    color={colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.location,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {user.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* API Key */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surfaceContainerHigh,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            API Key
          </Text>
          {!editing ? (
            <View style={styles.keyRow}>
              <Text
                style={[
                  styles.keyText,
                  {
                    color: colors.onSurfaceVariant,
                    fontFamily: ct.fontFamily.regular,
                  },
                ]}
              >
                {maskedKey}
              </Text>
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={[styles.editBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="edit" size={14} color={colors.onPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClear}
                style={[
                  styles.editBtn,
                  { backgroundColor: colors.errorContainer },
                ]}
              >
                <Feather
                  name="trash-2"
                  size={14}
                  color={colors.onErrorContainer}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editSection}>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outline,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.onSurface,
                      fontFamily: ct.fontFamily.regular,
                    },
                  ]}
                  placeholder="waka_..."
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={newKey}
                  onChangeText={setNewKey}
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShow((s) => !s)}>
                  <Feather
                    name={show ? "eye-off" : "eye"}
                    size={16}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.btnRow}>
                {isConfigured ? (
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.outline }]}
                    onPress={() => {
                      setEditing(false);
                      setNewKey("");
                    }}
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: saving || !newKey.trim() ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleSave}
                  disabled={saving || !newKey.trim()}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.onPrimary} size="small" />
                  ) : (
                    <Text
                      style={[styles.saveText, { color: colors.onPrimary }]}
                    >
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        {/* About */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surfaceContainerHigh },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            About
          </Text>
          <Text
            style={[
              ct.text.body,
              { color: colors.onSurfaceVariant, marginBottom: ct.md },
            ]}
          >
            made by infinotiver {"<3"}
          </Text>
          <View style={{ flexDirection: "row", gap: ct.sm }}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://github.com/infinotiver/wakadash")
              }
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: ct.xs,
                padding: ct.padding.lg,
                borderRadius: ct.radius.full,
                backgroundColor: colors.primary,
              }}
            >
              <Feather name="github" size={18} color={colors.onPrimary} />
              <Text style={[ct.text.buttonText, { color: colors.onPrimary }]}>
                Source Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://github.com/infinotiver/wakadash/issues",
                )
              }
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: ct.xs,
                padding: ct.padding.lg,
                borderRadius: ct.radius.full,
                backgroundColor: colors.secondaryContainer,
              }}
            >
              <Feather
                name="alert-circle"
                size={18}
                color={colors.onSecondaryContainer}
              />
              <Text
                style={[
                  ct.text.buttonText,
                  { color: colors.onSecondaryContainer },
                ]}
              >
                Report Issue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
