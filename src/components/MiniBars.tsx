import React from "react";
import { View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export function MiniBars({ values }: { values: number[] }) {
  const colors = useColors();
  const max = Math.max(1, ...values);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: ct.space.xs - 1,
        height: 28,
      }}
    >
      {values.map((value, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: `${Math.max(8, (value / max) * 100)}%`,
            borderRadius: ct.radius.full,
            backgroundColor: colors.primary,
            opacity: index === values.length - 1 ? 1 : 0.3,
          }}
        />
      ))}
    </View>
  );
}
