import React from "react";
import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
import type { GoalStatus } from "@/src/types/wakatime";
import { statusMeta } from "@/src/utils/goals";

export function GoalStatusChip({ status }: { status: GoalStatus }) {
  const c = useColors();
  const m = statusMeta(status, c);
  return (
    <View
      style={{
        paddingHorizontal: ct.space.md,
        paddingVertical: ct.space.xs,
        borderRadius: ct.radius.full,
        backgroundColor: m.container,
      }}
    >
      <Text style={[ct.text.tagText, { color: m.onContainer }]}>{m.label}</Text>
    </View>
  );
}
