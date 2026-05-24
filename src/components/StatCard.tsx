import React from "react";
import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { styles } from "@/src/constants/stat-card.style";

interface StatCardProps {
  label: string;
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
        styles.card,
        {
          backgroundColor: accent ? colors.primary : colors.card,
          borderColor: colors.border,
          flex: flex ?? 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: accent ? colors.primaryForeground : colors.mutedForeground },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
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
            styles.subtitle,
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
