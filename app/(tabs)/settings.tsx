import React, { useEffect, useState } from "react";
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
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaUser } from "@/src/hooks/useWakaTimeQueries";
import { wakatimeApi, DEFAULT_BASE_URL } from "@/src/api/wakatime";
import type { WakaUser } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import { AppBar } from "@/src/components/AppBar";
import { Button } from "@/src/components/Button";

const styles = ct.styles.settings;

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
          {
            color: c.onSurfaceVariant,
            fontFamily: ct.fontFamily.regular,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Button
        label="Edit"
        icon={
          <MaterialIcons name="edit" size={18} color={c.onSecondaryContainer} />
        }
        variant="tonal"
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
          <MaterialIcons name="delete" size={18} color={c.error} />
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
  showCancel = true,
}: {
  onCancel?: () => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
}) {
  return (
    <View
      style={[
        styles.btnRow,
        {
          flexDirection: "row",
          gap: ct.space.sm,
        },
      ]}
    >
      {showCancel && onCancel ? (
        <Button label="Cancel" variant="outlined" onPress={onCancel} flex={1} />
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <Button
        label="Save"
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
    } catch (error) {
      Alert.alert(
        error instanceof Error && error.message === "Invalid API key"
          ? "Invalid key"
          : "Error",
        error instanceof Error && error.message === "Invalid API key"
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

  function cancelUrl() {
    setEditingUrl(false);
    setNewUrl(baseUrl);
  }

  function cancelKey() {
    setEditingKey(false);
    setNewKey("");
    setShow(false);
  }

  const user = userQ.data as WakaUser | undefined;
  const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "";

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
          { paddingBottom: insets.bottom + ct.space.lg },
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
                <MaterialIcons
                  name="account-circle"
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
                  <MaterialIcons
                    name="location-pin"
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
                    backgroundColor: c.surfaceContainerHigh,
                    borderColor: c.outline,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: c.onSurface,
                      fontFamily: ct.fontFamily.regular,
                    },
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
                {URL_SUGGESTIONS.map((suggestion) => {
                  const selected =
                    newUrl.trim().replace(/\/+$/, "") === suggestion.url;

                  return (
                    <TouchableOpacity
                      key={suggestion.url}
                      onPress={() => setNewUrl(suggestion.url)}
                      activeOpacity={0.8}
                      style={{
                        paddingVertical: ct.padding.sm,
                        paddingHorizontal: ct.padding.md,
                        borderRadius: ct.radius.full,
                        borderWidth: 1,
                        borderColor: selected
                          ? c.secondaryContainer
                          : c.outline,
                        backgroundColor: selected
                          ? c.secondaryContainer
                          : c.surfaceContainerHigh,
                      }}
                    >
                      <Text
                        style={[
                          ct.text.buttonText,
                          {
                            color: selected
                              ? c.onSecondaryContainer
                              : c.onSurfaceVariant,
                          },
                        ]}
                      >
                        {suggestion.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ActionButtons
                onCancel={cancelUrl}
                onSave={handleSaveUrl}
                saving={savingUrl}
                disabled={!newUrl.trim()}
              />
            </View>
          )}
        </View>

        <View
          style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}
        >
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
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
                    backgroundColor: c.surfaceContainerHigh,
                    borderColor: c.outline,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: c.onSurface,
                      fontFamily: ct.fontFamily.regular,
                    },
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
                  activeOpacity={0.8}
                  style={{ padding: ct.padding.sm }}
                >
                  <MaterialCommunityIcons
                    name={show ? "eye-off" : "eye"}
                    size={18}
                    color={c.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              <ActionButtons
                onCancel={isConfigured ? cancelKey : undefined}
                onSave={handleSaveKey}
                saving={savingKey}
                disabled={!newKey.trim()}
                showCancel={isConfigured}
              />
            </View>
          )}
        </View>

        <View
          style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}
        >
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
            About
          </Text>

          <Text
            style={[
              ct.text.body,
              {
                color: c.onSurfaceVariant,
                marginBottom: ct.space.md,
              },
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
              icon={
                <MaterialCommunityIcons
                  name="github"
                  size={18}
                  color={c.onPrimary}
                />
              }
              onPress={() =>
                Linking.openURL("https://github.com/infinotiver/wakadash")
              }
              flex={1}
              backgroundColor={c.primary}
              color={c.onPrimary}
            />

            <Button
              label="Report Issue"
              icon={
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color={c.onSecondaryContainer}
                />
              }
              onPress={() =>
                Linking.openURL(
                  "https://github.com/infinotiver/wakadash/issues",
                )
              }
              flex={1}
              variant="tonal"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
