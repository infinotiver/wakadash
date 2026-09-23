import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetConfigurationScreenProps } from "react-native-android-widget";

import {
  EMPTY,
  TopBreakdownWidget,
  STAT_LABELS,
  type StatKey,
  type WidgetData,
} from "./index";
import { readCache, fetchFresh, statKeyFor } from "./widget-task-handler";

const STAT_OPTIONS: StatKey[] = ["languages", "projects", "system"];

export function WidgetConfigurationScreen({
  widgetInfo,
  setResult,
  renderWidget,
}: WidgetConfigurationScreenProps) {
  const [selected, setSelected] = useState<StatKey>("languages");
  const [data, setData] = useState<WidgetData>(EMPTY);

  // preview data: same source the task handler uses, cache first
  useEffect(() => {
    (async () => {
      const cached = await readCache();
      setData(cached);
      renderWidget(<TopBreakdownWidget data={cached} stat="languages" />);
      const fresh = await fetchFresh();
      if (fresh) setData(fresh);
    })();
  }, []);

  const choose = async (stat: StatKey) => {
    setSelected(stat);
    await AsyncStorage.setItem(statKeyFor(widgetInfo.widgetId), stat);
    renderWidget(<TopBreakdownWidget data={data} stat={stat} />);
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        Choose a stat to show
      </Text>

      {STAT_OPTIONS.map((stat) => (
        <TouchableOpacity
          key={stat}
          onPress={() => choose(stat)}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: stat === selected ? "#2A3B39" : "#1E2C2B",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            {STAT_LABELS[stat]}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => setResult("ok")}
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: "#8FD9C6",
        }}
      >
        <Text style={{ color: "#04342C", fontWeight: "600", fontSize: 16 }}>
          Add widget
        </Text>
      </TouchableOpacity>
    </View>
  );
}
