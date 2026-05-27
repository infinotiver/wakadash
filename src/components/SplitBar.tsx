import React from "react";
import { Text, View } from "react-native";
import { t, SPACING, RADIUS } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";

interface Segment {
  label: string;
  value: number;
  displayValue: string;
}

interface Props {
  left: Segment;
  right: Segment;
  height?: number;
}

export function SplitBar({ left, right, height = 8 }: Props) {
  const c = useColors();
  const total = left.value + right.value;
  const leftPct = total > 0 ? (left.value / total) * 100 : 50;

  return (
    <View style={{ gap: SPACING.xs }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={[t.caption, { color: c.mutedForeground }]}>
          {left.label}
        </Text>
        <Text style={[t.caption, { color: c.mutedForeground }]}>
          {right.label}
        </Text>
      </View>
      <View
        style={{
          height,
          borderRadius: RADIUS.full,
          overflow: "hidden",
          flexDirection: "row",
          backgroundColor: c.secondary,
        }}
      >
        <View style={{ width: `${leftPct}%`, backgroundColor: c.primary }} />
        <View style={{ flex: 1, backgroundColor: c.primary + "33" }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={[
            t.caption,
            { color: c.primary, fontFamily: "Inter_500Medium" },
          ]}
        >
          {left.displayValue}
        </Text>
        <Text
          style={[
            t.caption,
            { color: c.mutedForeground, fontFamily: "Inter_500Medium" },
          ]}
        >
          {right.displayValue}
        </Text>
      </View>
    </View>
  );
}
