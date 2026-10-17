import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import {
  getConfig,
  saveConfig,
  type BreakdownKey,
  type TodayNotificationConfig,
} from "@/src/notifications/todayNotification";

const styles = ct.styles.settings;

const ITEMS: { label: string; value: BreakdownKey }[] = [
  { label: "Categories", value: "categories" },
  { label: "Languages", value: "languages" },
  { label: "Editors", value: "editors" },
  { label: "Projects", value: "projects" },
  { label: "OS", value: "operating_systems" },
];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingVertical: ct.padding.sm,
        paddingHorizontal: ct.padding.md,
        borderRadius: ct.radius.full,
        borderWidth: 1,
        borderColor: selected
          ? colors.secondaryContainer
          : colors.outlineVariant,
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
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function NotificationSettings() {
  const colors = useColors();
  const [config, setConfig] = useState<TodayNotificationConfig | null>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  if (Platform.OS !== "android" || !config) return null;

  async function update(patch: Partial<TodayNotificationConfig>) {
    const next = { ...config!, ...patch };
    setConfig(next);
    const saved = await saveConfig(next);
    setConfig(saved);
    if (next.enabled && !saved.enabled) {
      Alert.alert(
        "Notifications blocked",
        "Allow notifications for WakaDash in system settings.",
      );
    }
  }

  function toggleItem(key: BreakdownKey) {
    const on = config!.show.includes(key);
    update({
      show: ITEMS.map((i) => i.value).filter((v) =>
        v === key ? !on : config!.show.includes(v),
      ),
    });
  }

  return (
    <View
      style={[styles.section, { backgroundColor: colors.surfaceContainerHigh }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={[styles.sectionTitle, { color: colors.onSurface, flex: 1 }]}
        >
          Today notification
        </Text>
        <Switch
          value={config.enabled}
          onValueChange={(enabled) => update({ enabled })}
          trackColor={{
            false: colors.surfaceContainerHighest,
            true: colors.primary,
          }}
          thumbColor={config.enabled ? colors.onPrimary : colors.outline}
        />
      </View>

      {config.enabled ? (
        <>
          <Text style={[ct.text.label, { color: colors.onSurfaceVariant }]}>
            Show top
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: ct.space.xs }}
          >
            {ITEMS.map((i) => (
              <Chip
                key={i.value}
                label={i.label}
                selected={config.show.includes(i.value)}
                onPress={() => toggleItem(i.value)}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
