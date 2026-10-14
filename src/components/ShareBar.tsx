import React from "react";
import { View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export function ShareBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const colors = useColors();

  return (
    <View
      style={{
        height: 8,
        borderRadius: ct.radius.full,
        overflow: "hidden",
        backgroundColor: colors.surfaceContainerHighest,
      }}
    >
      <View
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          height: "100%",
          backgroundColor: color,
        }}
      />
    </View>
  );
}
