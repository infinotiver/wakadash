import React from "react";
import { Text, View } from "react-native";
import { ct } from "../constants/styles.common";
import { useColors } from "../hooks/useColors";

interface StatCardProps {
  value?: string;
  subtitle?: string;
  icon?: (tintColor: string) => React.ReactNode;
  accent?: "teal" | "green" | "coral" | "amber" | "violet";
}

export function StatCard({
  value,
  subtitle,
  icon,
  accent = "violet",
}: StatCardProps) {
  const colors = useColors();
  const { colorContainer, onColorContainer } = colors.accent[accent];

  return (
    <View
      style={[
        ct.styles.flex,
        ct.styles.row,
        {
          backgroundColor: colors.surfaceContainerHigh,
          padding: ct.padding.sm,
          borderRadius: ct.radius["2xl"],
          gap: ct.padding.sm,
        },
      ]}
    >
      {icon ? (
        <View
          style={{
            borderRadius: ct.radius["full"],
            padding: ct.padding.sm,
            backgroundColor: colorContainer,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon(onColorContainer)}
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {value ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{value}</Text>
        ) : null}
        {subtitle ? (
          <Text style={{ color: colors.onSurface }}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
