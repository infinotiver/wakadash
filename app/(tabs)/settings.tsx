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
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaUser } from "@/src/hooks/useWakaTimeQueries";
import { wakatimeApi, DEFAULT_BASE_URL } from "@/src/api/wakatime";
import type { WakaUser } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import { AppBar } from "@/src/components/AppBar";
const styles = ct.styles.settings;

const URL_SUGGESTIONS = [
  { label: "WakaTime", url: DEFAULT_BASE_URL },
  {
    label: "Hackatime",
    url: "https://hackatime.hackclub.com/api/hackatime/v1",
  },
];

// shared row shape for both the API Key and API URL sections: a masked/plain
// value, an edit affordance, and an optional destructive action
function FieldRow({
  value,
  onEdit,
  onDelete,
}: {
  value: string;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.keyRow}>
      <Text
        style={[
          styles.keyText,
          { color: colors.onSurfaceVariant, fontFamily: ct.fontFamily.regular },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <TouchableOpacity
        onPress={onEdit}
        style={[styles.editBtn, { backgroundColor: colors.primary }]}
      >
        <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
      </TouchableOpacity>
      {onDelete ? (
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.editBtn, { backgroundColor: colors.errorContainer }]}
        >
          <MaterialIcons
            name="delete"
            size={16}
            color={colors.onErrorContainer}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured, apiKey, setApiKey, clearApiKey, baseUrl, setBaseUrl } =
    useWakaTime();

  const [editingKey, setEditingKey] = useState(!isConfigured);
  const [newKey, setNewKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [show, setShow] = useState(false);

  const [editingUrl, setEditingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState(baseUrl);
  const [savingUrl, setSavingUrl] = useState(false);

  const userQ = useWakaUser();

  useEffect(() => {
    if (!isConfigured) setEditingKey(true);
  }, [isConfigured]);

  async function handleSaveKey() {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setSavingKey(true);
    try {
      await wakatimeApi.verifyKey(trimmed, baseUrl);
      await setApiKey(trimmed);
      setEditingKey(false);
      setNewKey("");
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid API key") {
        Alert.alert("Invalid key", "Check your API key and try again.");
      } else {
        Alert.alert("Error", "Could not verify key. Check your connection.");
      }
    } finally {
      setSavingKey(false);
    }
  }

  function handleClearKey() {
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
            setEditingKey(true);
          },
        },
      ],
    );
  }

  async function handleSaveUrl() {
    const trimmed = newUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/.+/.test(trimmed)) {
      Alert.alert(
        "Invalid URL",
        "Enter a full URL starting with http:// or https://",
      );
      return;
    }
    setSavingUrl(true);
    try {
      await setBaseUrl(trimmed);
      setEditingUrl(false);
    } finally {
      setSavingUrl(false);
    }
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
              { backgroundColor: colors.surfaceContainerHigh },
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
                <MaterialIcons
                  name="account-circle"
                  size={28}
                  color={colors.onPrimary}
                />
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
                  <MaterialIcons
                    name="location-pin"
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

        {/* API URL */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surfaceContainerHigh },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            API URL
          </Text>
          {!editingUrl ? (
            <FieldRow
              value={baseUrl}
              onEdit={() => {
                setNewUrl(baseUrl);
                setEditingUrl(true);
              }}
            />
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
                  placeholder={DEFAULT_BASE_URL}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={newUrl}
                  onChangeText={setNewUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: ct.xs,
                  marginTop: ct.sm,
                }}
              >
                {URL_SUGGESTIONS.map((s) => {
                  const selected = newUrl.trim().replace(/\/+$/, "") === s.url;
                  return (
                    <TouchableOpacity
                      key={s.url}
                      onPress={() => setNewUrl(s.url)}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: ct.padding.lg,
                        paddingVertical: ct.xs,
                        borderRadius: ct.radius.full,
                        borderWidth: 1,
                        borderColor: selected
                          ? colors.secondaryContainer
                          : colors.outline,
                        backgroundColor: selected
                          ? colors.secondaryContainer
                          : colors.surfaceContainerHigh,
                      }}
                    >
                      <Text
                        style={[
                          ct.text.buttonText,
                          {
                            color: selected
                              ? colors.onSecondaryContainer
                              : colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: colors.surfaceContainerLow },
                  ]}
                  onPress={() => {
                    setEditingUrl(false);
                    setNewUrl(baseUrl);
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

        {/* API Key */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surfaceContainerHigh },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            API Key
          </Text>
          {!editingKey ? (
            <FieldRow
              value={maskedKey}
              onEdit={() => setEditingKey(true)}
              onDelete={handleClearKey}
            />
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
                  <MaterialCommunityIcons
                    name={show ? "eye-off" : "eye"}
                    size={16}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.btnRow}>
                {isConfigured ? (
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: colors.surfaceContainerLow },
                    ]}
                    onPress={() => {
                      setEditingKey(false);
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
                      opacity: savingKey || !newKey.trim() ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleSaveKey}
                  disabled={savingKey || !newKey.trim()}
                  activeOpacity={0.8}
                >
                  {savingKey ? (
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
              <MaterialCommunityIcons
                name="github"
                size={18}
                color={colors.onPrimary}
              />
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
              <MaterialCommunityIcons
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
