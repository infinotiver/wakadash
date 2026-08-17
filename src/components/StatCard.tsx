import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

interface StatCardProps {
  label?: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
          {icon}
        </View>
      ) : null}

      <View style={styles.textColumn}>
        {label ? (
          <Text
            style={[styles.label, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
        <Text
          style={[styles.value, { color: colors.foreground }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: ct.padding.md,
    padding: ct.padding.md,
    borderRadius: ct.radius.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: ct.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    ...ct.text.captionMedium,
  },
  value: {
    ...ct.text.valueSm,
    lineHeight: undefined,
  },
  subtitle: {
    ...ct.text.caption,
  },
});
