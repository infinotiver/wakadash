import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export type DashboardWidgetVariant =
  | "surface"
  | "primary"
  | "secondary"
  | "tertiary";

interface DashboardBackgroundFill {
  percent: number;
  color: string;
  backgroundColor: string;
  foregroundColor: string;
}

interface DashboardWidgetProps {
  title: string;
  onPress?: () => void;
  variant?: DashboardWidgetVariant;
  /** Backward-compatible alias for variant="primary". */
  hero?: boolean;
  half?: boolean;
  flex?: number;
  backgroundFill?: DashboardBackgroundFill;
  children?: React.ReactNode;
}

export function DashboardWidget({
  title,
  onPress,
  variant = "surface",
  hero = false,
  half = false,
  flex,
  backgroundFill,
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

  const headerColor = backgroundFill?.foregroundColor ?? variantStyles.color;
  const resolvedFlex = flex ?? (half ? 1 : undefined);

  const fillPercent = Math.min(Math.max(backgroundFill?.percent ?? 0, 0), 100);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={title}
      style={({ pressed }) => ({
        flex: resolvedFlex,
        minWidth: resolvedFlex !== undefined ? 0 : undefined,
        padding: ct.space.md,
        borderRadius: ct.radius["2xl"],
        gap: ct.space.sm,
        backgroundColor:
          backgroundFill?.backgroundColor ?? variantStyles.backgroundColor,
        overflow: backgroundFill ? "hidden" : undefined,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {backgroundFill ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${fillPercent}%`,
            backgroundColor: backgroundFill.color,
          }}
        />
      ) : null}

      <View
        style={[
          ct.styles.rowCenter,
          {
            gap: 8,
            width: "100%",
          },
        ]}
      >
        <Text
          style={[
            ct.text.bodyMedium,
            {
              color: headerColor,
              fontSize: 15,
              flex: 1,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {onPress ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={headerColor}
          />
        ) : null}
      </View>

      {children}
    </Pressable>
  );
}
