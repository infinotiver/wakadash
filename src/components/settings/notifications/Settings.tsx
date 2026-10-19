import { useEffect, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import {
  getConfig,
  saveConfig,
  type BreakdownKey,
  type TodayNotificationConfig,
} from "@/src/notifications/todayNotification";

const ITEMS: { label: string; value: BreakdownKey }[] = [
  { label: "Categories", value: "categories" },
  { label: "Languages", value: "languages" },
  { label: "Editors", value: "editors" },
  { label: "Projects", value: "projects" },
  { label: "OS", value: "operating_systems" },
];

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
      style={[
        ct.styles.settings.section,
        { backgroundColor: colors.surfaceContainerHigh },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={[
            ct.text.sectionTitle,
            {
              color: colors.onSurface,
            },
          ]}
        >
          Today notification
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => update({ enabled: !config.enabled })}
          style={{
            width: 52,
            height: 32,
            borderRadius: ct.radius.full,
            borderWidth: config.enabled ? 0 : 2,
            borderColor: colors.outline,
            backgroundColor: config.enabled
              ? colors.primary
              : colors.surfaceContainerHighest,
            justifyContent: "center",
            paddingHorizontal: config.enabled ? 4 : 6,
          }}
        >
          <View
            style={{
              width: config.enabled ? 24 : 16,
              height: config.enabled ? 24 : 16,
              borderRadius: 12,
              backgroundColor: config.enabled
                ? colors.onPrimary
                : colors.outline,
              alignSelf: config.enabled ? "flex-end" : "flex-start",
            }}
          />
        </TouchableOpacity>
      </View>

      {config.enabled && (
        <>
          <Text style={[ct.text.body, { color: colors.onSurfaceVariant }]}>
            Show top
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: ct.space.xs }}
          >
            {ITEMS.map((i) => {
              const selected = config.show.includes(i.value);
              return (
                <TouchableOpacity
                  key={i.value}
                  activeOpacity={0.7}
                  onPress={() => toggleItem(i.value)}
                  style={{
                    paddingVertical: ct.space.sm,
                    paddingHorizontal: ct.space.md,
                    borderRadius: ct.radius.full,
                    borderWidth: 1,
                    borderColor: selected
                      ? colors.secondaryContainer
                      : colors.outlineVariant,
                    backgroundColor: selected
                      ? colors.secondaryContainer
                      : "transparent",
                  }}
                >
                  <Text
                    style={[
                      ct.text.bodyMedium,
                      {
                        color: selected
                          ? colors.onSecondaryContainer
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {i.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
