import React from "react";
import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { breakdownItemStyles as styles } from "@/src/constants/styles.components";

interface BreakdownItemProps {
  name: string;
  text: string;
  percent: number;
  color: string;
}

export function BreakdownItem({
  name,
  text,
  percent,
  color,
}: BreakdownItemProps) {
  const colors = useColors();
  const barWidth = `${Math.max(4, Math.min(100, percent))}%`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.meta}>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={[styles.time, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {text} · {percent.toFixed(1)}%
          </Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: color, width: barWidth as any },
          ]}
        />
      </View>
    </View>
  );
}
