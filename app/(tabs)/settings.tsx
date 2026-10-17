import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaUser } from "@/src/hooks/useWakaTimeQueries";
import { wakatimeApi, DEFAULT_BASE_URL } from "@/src/api/wakatime";
import type { WakaUser } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import { AppBar } from "@/src/components/AppBar";
import { Button } from "@/src/components/Button";
import { NotificationSettings } from "@/src/components/settings/notifications/Settings";
const styles = ct.styles.settings;
const appVersion = Constants.expoConfig?.version ?? "unknown";
const gitCommit =
  (Constants.expoConfig?.extra?.gitCommit as string | undefined) ?? "dev";

const URL_SUGGESTIONS = [
  { label: "WakaTime", url: DEFAULT_BASE_URL },
  {
    label: "Hackatime",
    url: "https://hackatime.hackclub.com/api/hackatime/v1",
  },
];

function FieldRow({
  value,
  onEdit,
  onDelete,
}: {
  value: string;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const c = useColors();

  return (
    <View style={styles.keyRow}>
      <Text
        style={[
          styles.keyText,
          { color: c.onSurfaceVariant, fontFamily: ct.fontFamily.regular },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Button
        label="Edit"
        variant="tonal"
        tone="secondary"
        icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="pencil-outline"
            size={size}
            color={color}
          />
        )}
        onPress={onEdit}
      />

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.8}
          style={{
            width: 40,
            height: 40,
            borderRadius: ct.radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.errorContainer,
          }}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={c.onErrorContainer}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ActionButtons({
  onCancel,
  onSave,
  saving,
  disabled,
}: {
  onCancel?: () => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.btnRow, { flexDirection: "row", gap: ct.space.sm }]}>
      {onCancel ? (
        <Button
          label="Cancel"
          variant="outlined"
          tone="secondary"
          onPress={onCancel}
          flex={1}
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <Button
        label="Save"
        variant="filled"
        tone="primary"
        onPress={onSave}
        loading={saving}
        disabled={disabled}
        flex={1}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const c = useColors();
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
  const user = userQ.data as WakaUser | undefined;

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
      setShow(false);
    } catch (e) {
      const isInvalid = e instanceof Error && e.message === "Invalid API key";
      Alert.alert(
        isInvalid ? "Invalid key" : "Error",
        isInvalid
          ? "Check your API key and try again."
          : "Could not verify key. Check your connection.",
      );
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

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar
        title="Settings"
        variant="small"
        elevated={false}
        leadingIcon="arrow-left"
        leadingLabel="Go back"
        onLeadingPress={() => router.back()}
        actions={[]}
      />

      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + ct.space.xl },
        ]}
      >
        {userQ.isLoading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: ct.size.loadingCompact }}
          />
        ) : user ? (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: c.surfaceContainerHigh },
            ]}
          >
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatarFallback, { backgroundColor: c.primary }]}
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={28}
                  color={c.onPrimary}
                />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: c.onSurface }]}>
                {user.display_name || user.username}
              </Text>
              <Text style={[styles.username, { color: c.onSurfaceVariant }]}>
                @{user.username}
              </Text>
              {user.location && (
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={12}
                    color={c.onSurfaceVariant}
                  />
                  <Text
                    style={[styles.location, { color: c.onSurfaceVariant }]}
                  >
                    {user.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* API URL Card */}
        <View
          style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}
        >
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
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
                    backgroundColor: c.surfaceContainerHighest,
                    borderColor: c.outline,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { color: c.onSurface, fontFamily: ct.fontFamily.regular },
                  ]}
                  placeholder={DEFAULT_BASE_URL}
                  placeholderTextColor={c.onSurfaceVariant}
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
                  gap: ct.space.xs,
                  marginTop: ct.space.sm,
                }}
              >
                {URL_SUGGESTIONS.map((s) => {
                  const selected = newUrl.trim().replace(/\/+$/, "") === s.url;
                  return (
                    <Button
                      key={s.url}
                      label={s.label}
                      variant={selected ? "tonal" : "outlined"}
                      tone="secondary"
                      onPress={() => setNewUrl(s.url)}
                    />
                  );
                })}
              </View>

              <ActionButtons
                onCancel={() => {
                  setEditingUrl(false);
                  setNewUrl(baseUrl);
                }}
                onSave={handleSaveUrl}
                saving={savingUrl}
                disabled={!newUrl.trim()}
              />
            </View>
          )}
        </View>

        {/* API Key Card */}
        <View
          style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}
        >
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
            API Key/Token
          </Text>
          {!editingKey ? (
            <FieldRow
              value={
                apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : ""
              }
              onEdit={() => setEditingKey(true)}
              onDelete={handleClearKey}
            />
          ) : (
            <View style={styles.editSection}>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: c.surfaceContainerHighest,
                    borderColor: c.outline,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { color: c.onSurface, fontFamily: ct.fontFamily.regular },
                  ]}
                  placeholder="waka_..."
                  placeholderTextColor={c.onSurfaceVariant}
                  value={newKey}
                  onChangeText={setNewKey}
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShow((s) => !s)}
                  style={{ padding: ct.padding.sm }}
                >
                  <MaterialCommunityIcons
                    name={show ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={c.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              <ActionButtons
                onCancel={
                  isConfigured
                    ? () => {
                        setEditingKey(false);
                        setNewKey("");
                        setShow(false);
                      }
                    : undefined
                }
                onSave={handleSaveKey}
                saving={savingKey}
                disabled={!newKey.trim()}
              />
            </View>
          )}
          <Text style={{ fontSize: ct.fontSize.xs, color: c.onSurfaceVariant }}>
            Delete they key to use WakaTime OAuth on Setup Screen.
          </Text>
        </View>
        <NotificationSettings />
        <View
          style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}
        >
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
            About
          </Text>
          <Text
            style={[
              ct.text.body,
              { color: c.onSurfaceVariant, marginBottom: ct.space.md },
            ]}
          >
            made by infinotiver {"<3"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: ct.space.sm,
            }}
          >
            <Button
              label="Source Code"
              variant="filled"
              tone="primary"
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="github"
                  size={size}
                  color={color}
                />
              )}
              onPress={() =>
                Linking.openURL("https://github.com/infinotiver/wakadash")
              }
              flex={1}
            />
            <Button
              label="Report Issue"
              variant="tonal"
              tone="primary"
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={size}
                  color={color}
                />
              )}
              onPress={() =>
                Linking.openURL(
                  "https://github.com/infinotiver/wakadash/issues",
                )
              }
              flex={1}
            />
          </View>

          <Button
            label="View Releases"
            // variant="tonal"
            tone="tertiary"
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="tag-multiple-outline"
                size={size}
                color={color}
              />
            )}
            onPress={() =>
              Linking.openURL(
                "https://github.com/infinotiver/wakadash/releases",
              )
            }
            width="100%"
          />
        </View>

        {/* Version Footer */}
        <View
          style={{
            alignItems: "center",
            gap: ct.space.xs,
            paddingVertical: ct.space.md,
          }}
        >
          <Text style={[ct.text.bodyMedium, { color: c.onSurfaceVariant }]}>
            WakaDash v{appVersion}
          </Text>
          <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
            Commit {gitCommit}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
