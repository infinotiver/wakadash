import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetConfigurationScreenProps } from "react-native-android-widget";

import colors from "@/src/constants/colors";
import { ct } from "@/src/constants/styles.common";

import {
  EMPTY,
  TopBreakdownWidget,
  STAT_LABELS,
  type StatKey,
  type WidgetData,
} from "./index";
import { readCache, fetchFresh, statKeyFor } from "./widget-task-handler";

const STAT_OPTIONS: StatKey[] = ["languages", "projects", "system"];
const UI = colors.dark;

export function WidgetConfigurationScreen({
  widgetInfo,
  setResult,
  renderWidget,
}: WidgetConfigurationScreenProps) {
  const [selected, setSelected] = useState<StatKey>("languages");
  const [data, setData] = useState<WidgetData>(EMPTY);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const stored = await AsyncStorage.getItem(
        statKeyFor(widgetInfo.widgetId),
      );

      const initial: StatKey =
        stored && STAT_OPTIONS.includes(stored as StatKey)
          ? (stored as StatKey)
          : "languages";

      if (!mounted) return;
      setSelected(initial);

      const cached = await readCache();

      if (!mounted) return;
      setData(cached);
      renderWidget(<TopBreakdownWidget data={cached} stat={initial} />);

      const fresh = await fetchFresh();

      if (!mounted || !fresh) return;
      setData(fresh);
      renderWidget(<TopBreakdownWidget data={fresh} stat={initial} />);
    })();

    return () => {
      mounted = false;
    };
  }, [widgetInfo.widgetId, renderWidget]);

  const choose = async (stat: StatKey) => {
    setSelected(stat);

    await AsyncStorage.setItem(statKeyFor(widgetInfo.widgetId), stat);

    renderWidget(<TopBreakdownWidget data={data} stat={stat} />);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: UI.background,
        paddingHorizontal: ct.space["4xl"],
        paddingVertical: ct.space["4xl"],
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "center",
            marginTop: ct.space["2xl"],
            marginBottom: ct.space["3xl"],
          }}
        >
          <Text
            style={{
              fontSize: ct.fontSize["2xl"],
              fontFamily: ct.fontFamily.semibold,
              color: UI.onSurface,
              textAlign: "center",
            }}
          >
            Configure widget
          </Text>

          <Text
            style={{
              marginTop: ct.space.sm,
              fontSize: ct.fontSize.md,
              fontFamily: ct.fontFamily.regular,
              color: UI.onSurfaceVariant,
              textAlign: "center",
            }}
          >
            Choose which breakdown to show.
          </Text>
        </View>

        {/* Selection */}
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              marginBottom: ct.space.md,
              fontSize: ct.fontSize.sm,
              fontFamily: ct.fontFamily.medium,
              color: UI.onSurfaceVariant,
            }}
          >
            Breakdown
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: ct.space.sm,
            }}
          >
            {STAT_OPTIONS.map((stat) => {
              const isSelected = stat === selected;

              return (
                <TouchableOpacity
                  key={stat}
                  onPress={() => choose(stat)}
                  activeOpacity={0.8}
                  style={{
                    minWidth: 110,
                    alignItems: "center",
                    borderRadius: ct.radius.full,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: UI.outline,
                    backgroundColor: isSelected
                      ? UI.secondaryContainer
                      : UI.surfaceContainerLow,
                    paddingHorizontal: ct.space.xl,
                    paddingVertical: ct.space.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: ct.fontSize.md,
                      fontFamily: ct.fontFamily.medium,
                      color: isSelected
                        ? UI.onSecondaryContainer
                        : UI.onSurface,
                    }}
                  >
                    {STAT_LABELS[stat]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: ct.space.md,
            marginBottom: ct.space.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => setResult("cancel")}
            activeOpacity={0.8}
            style={{
              minWidth: 120,
              alignItems: "center",
              borderRadius: ct.radius.full,
              borderWidth: 1,
              borderColor: UI.outline,
              backgroundColor: UI.surfaceContainerLow,
              paddingHorizontal: ct.space.xl,
              paddingVertical: ct.space.md,
            }}
          >
            <Text
              style={{
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.medium,
                color: UI.onSurface,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setResult("ok")}
            activeOpacity={0.8}
            style={{
              minWidth: 120,
              alignItems: "center",
              borderRadius: ct.radius.full,
              backgroundColor: UI.primary,
              paddingHorizontal: ct.space.xl,
              paddingVertical: ct.space.md,
            }}
          >
            <Text
              style={{
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.semibold,
                color: UI.onPrimary,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
