import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
const styles = ct.styles.settings;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isConfigured,
    apiKey,
    setApiKey,
    clearApiKey,
  } = useWakaTime();

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
    <ScrollView
      style={[ct.styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + ct.lg,
        },
      ]}
    >
      <View
        style={[
          ct.styles.appBar,
          { paddingTop: Platform.OS === "web" ? ct.sm : insets.top },
        ]}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={ct.styles.appBarIcon}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={ct.styles.appBarIcon} />
      </View>

      {userQ.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: ct.layout.loadingCompact }} />
      ) : user ? (
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
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
              <Feather name="user" size={28} color={colors.primaryForeground} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.displayName, { color: colors.foreground }]}>
              {user.display_name || user.username}
            </Text>
            <Text style={[styles.username, { color: colors.mutedForeground }]}>
              @{user.username}
            </Text>
            {user.location ? (
              <View style={styles.locationRow}>
                <Feather
                  name="map-pin"
                  size={12}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.location, { color: colors.mutedForeground }]}
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
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          API Key
        </Text>
        {!editing ? (
          <View style={styles.keyRow}>
            <Text
              style={[
                styles.keyText,
                {
                  color: colors.mutedForeground,
                  fontFamily: ct.fontFamily.regular,
                },
              ]}
            >
              {maskedKey}
            </Text>
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={[styles.editBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="edit-2" size={14} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClear}
              style={[
                styles.editBtn,
                { backgroundColor: colors.destructive + "22" },
              ]}
            >
              <Feather name="trash-2" size={14} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editSection}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: colors.foreground, fontFamily: ct.fontFamily.regular },
                ]}
                placeholder="waka_..."
                placeholderTextColor={colors.mutedForeground}
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
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.btnRow}>
              {isConfigured ? (
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    setEditing(false);
                    setNewKey("");
                  }}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      { color: colors.mutedForeground },
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
                  <ActivityIndicator
                    color={colors.primaryForeground}
                    size="small"
                  />
                ) : (
                  <Text
                    style={[
                      styles.saveText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Credits */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Credits
        </Text>
        <View style={[ct.styles.row, { borderTopColor: colors.border }]}>
          <Text style={[ct.text.body, { color: colors.foreground }]}>
            made with love by infinotiver
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
