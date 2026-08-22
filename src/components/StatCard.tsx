import React from "react";
import { Text, View } from "react-native";
import { ct } from "../constants/styles.common";
import { useColors } from "../hooks/useColors";

interface StatCardProps {
  value?: string;
  subtitle?: string;
  icon?: (tintColor: string) => React.ReactNode;
  iconTintColor?: string;
  iconBackgroundColor?: string;
}

export function StatCard({
  value,
  subtitle,
  icon,
  iconTintColor,
  iconBackgroundColor,
}: StatCardProps) {
  const colors = useColors();

  const resolvedIconTintColor = iconTintColor ?? colors.onSecondary;
  const resolvedIconBackgroundColor = iconBackgroundColor ?? colors.secondary;

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
            backgroundColor: resolvedIconBackgroundColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon(resolvedIconTintColor)}
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {value ? (
          <Text
            style={{
              fontSize: ct.fontSize["xl"],
              fontFamily: ct.fontFamily.semibold,
              color: colors.onSurface,
            }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : null}

        {subtitle ? (
          <Text style={{ color: colors.onSurfaceVariant }}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
