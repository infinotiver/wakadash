import React from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export type DashboardFeatherName = React.ComponentProps<typeof Feather>["name"];
export type DashboardWidgetVariant =
  | "surface"
  | "primary"
  | "secondary"
  | "tertiary";

interface DashboardWidgetProps {
  icon: DashboardFeatherName;
  title: string;
  onPress?: () => void;
  variant?: DashboardWidgetVariant;
  /** Backward-compatible alias for variant="primary". */
  hero?: boolean;
  half?: boolean;
  children?: React.ReactNode;
}

export function DashboardWidget({
  icon,
  title,
  onPress,
  variant = "surface",
  hero = false,
  half = false,
  children,
}: DashboardWidgetProps) {
  const colors = useColors();
  const resolvedVariant = hero ? "primary" : variant;
  const variantStyles = {
    surface: {
      backgroundColor: colors.surfaceContainerHigh,
      color: colors.onSurfaceVariant,
    },
    primary: {
      backgroundColor: colors.primaryContainer,
      color: colors.onPrimaryContainer,
    },
    secondary: {
      backgroundColor: colors.secondaryContainer,
      color: colors.onSecondaryContainer,
    },
    tertiary: {
      backgroundColor: colors.tertiaryContainer,
      color: colors.onTertiaryContainer,
    },
  }[resolvedVariant];
  const headerColor = variantStyles.color;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={title}
      style={({ pressed }) => ({
        flex: half ? 1 : undefined,
        padding: ct.space.lg,
        borderRadius: ct.radius["2xl"],
        gap: ct.space.md,
        backgroundColor: variantStyles.backgroundColor,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={[ct.styles.rowCenter, { gap: ct.space.sm }]}>
        <Feather name={icon} size={16} color={headerColor} />
        <Text
          style={[ct.text.bodyMedium, { color: headerColor, flex: 1 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {onPress ? (
          <Feather name="chevron-right" size={16} color={headerColor} />
        ) : null}
      </View>
      {children}
    </Pressable>
  );
}
