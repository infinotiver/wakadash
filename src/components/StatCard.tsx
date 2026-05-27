import React from "react";
import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { commonStyles, t } from "@/src/constants/styles.common";

interface StatCardProps {
  label?: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
  flex?: number;
}

export function StatCard({
  label,
  value,
  subtitle,
  accent,
  flex,
}: StatCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        commonStyles.card,
        {
          backgroundColor: accent ? colors.primary : colors.card,
          borderColor: colors.border,
          flex: flex ?? 1,
        },
      ]}
    >
      {label ? (
        <Text
          style={[
            t.label,
            {
              color: accent ? colors.primaryForeground : colors.mutedForeground,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
      <Text
        style={[
          t.value,
          { color: accent ? colors.primaryForeground : colors.foreground },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {subtitle ? (
        <Text
          style={[
            t.caption,
            {
              color: accent
                ? colors.primaryForeground + "BB"
                : colors.mutedForeground,
            },
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
