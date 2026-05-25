import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import type { WakaUser } from "@/src/types/wakatime";
import { commonStyles as sharedStyles } from "@/src/constants/styles.common";
import { settingsScreenStyles as styles } from "@/src/constants/styles.screens";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    isConfigured,
    apiKey,
    setApiKey,
    clearApiKey,
    customApiUrl,
    setCustomApiUrl,
    clearCustomApiUrl,
    fetchUser,
  } = useWakaTime();

  const [editing, setEditing] = useState(!isConfigured);
  const [newKey, setNewKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const [editingUrl, setEditingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  const userQ = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    enabled: isConfigured,
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (!isConfigured) setEditing(true);
  }, [isConfigured]);

  async function handleSave() {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const encoded =
        typeof btoa !== "undefined"
          ? btoa(trimmed)
          : Buffer.from(trimmed).toString("base64");
      const res = await fetch("https://wakatime.com/api/v1/users/current", {
        headers: { Authorization: `Basic ${encoded}` },
      });
      if (res.status === 401) {
        Alert.alert("Invalid key", "Check your API key and try again.");
        return;
      }
      await setApiKey(trimmed);
      setEditing(false);
      setNewKey("");
    } catch {
      Alert.alert("Error", "Could not verify key. Check your connection.");
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

  async function handleSaveUrl() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setSavingUrl(true);
    try {
      await setCustomApiUrl(trimmed);
      setEditingUrl(false);
      setNewUrl("");
    } finally {
      setSavingUrl(false);
    }
  }

  function handleClearUrl() {
    Alert.alert(
      "Reset API URL?",
      "This will revert to the default WakaTime API endpoint.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearCustomApiUrl();
            setEditingUrl(false);
            setNewUrl("");
          },
        },
      ],
    );
  }

  const user = userQ.data as WakaUser | undefined;
  const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "";

  return (
    <ScrollView
      style={[sharedStyles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      {userQ.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
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
                  fontFamily: "Inter_400Regular",
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
                  { color: colors.foreground, fontFamily: "Inter_400Regular" },
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

      {/* Custom API URL */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Custom API URL
          </Text>
        </View>

        {!editingUrl ? (
          <View style={styles.keyRow}>
            <Text
              style={[
                styles.keyText,
                {
                  color: customApiUrl
                    ? colors.foreground
                    : colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              numberOfLines={1}
            >
              {customApiUrl ?? "https://api.wakatime.com/api/v1 (default)"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setNewUrl(customApiUrl ?? "");
                setEditingUrl(true);
              }}
              style={[styles.editBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="edit-2" size={14} color={colors.foreground} />
            </TouchableOpacity>
            {customApiUrl ? (
              <TouchableOpacity
                onPress={handleClearUrl}
                style={[
                  styles.editBtn,
                  { backgroundColor: colors.destructive + "22" },
                ]}
              >
                <Feather
                  name="rotate-ccw"
                  size={14}
                  color={colors.destructive}
                />
              </TouchableOpacity>
            ) : null}
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
                  { color: colors.foreground, fontFamily: "Inter_400Regular" },
                ]}
                placeholder="https://api.wakatime.com/api/v1"
                placeholderTextColor={colors.mutedForeground}
                value={newUrl}
                onChangeText={setNewUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setEditingUrl(false);
                  setNewUrl("");
                }}
              >
                <Text
                  style={[styles.cancelText, { color: colors.mutedForeground }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: savingUrl || !newUrl.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleSaveUrl}
                disabled={savingUrl || !newUrl.trim()}
                activeOpacity={0.8}
              >
                {savingUrl ? (
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
        <View style={[styles.creditRow, { borderTopColor: colors.border }]}>
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={[styles.creditLabel, { color: colors.mutedForeground }]}>
            Made by
          </Text>
          <Text style={[styles.creditValue, { color: colors.foreground }]}>
            Infinotiver
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
