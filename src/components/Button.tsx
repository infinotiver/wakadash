import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text";
export type ButtonTone = "primary" | "secondary" | "tertiary" | "error";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  icon?:
    | React.ReactNode
    | ((props: { color: string; size: number }) => React.ReactNode);
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  flex?: number;
  width?: DimensionValue;
  style?: ViewStyle;
  /** Custom overrides (optional) */
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function Button({
  label,
  onPress,
  variant = "filled",
  tone = "primary",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  flex,
  width,
  style,
  color,
  backgroundColor,
  borderColor,
}: ButtonProps) {
  const c = useColors();
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      solidBg: c.primary,
      solidFg: c.onPrimary,
      containerBg: c.primaryContainer,
      containerFg: c.onPrimaryContainer,
    },
    secondary: {
      solidBg: c.secondary,
      solidFg: c.onSecondary,
      containerBg: c.secondaryContainer,
      containerFg: c.onSecondaryContainer,
    },
    tertiary: {
      solidBg: c.tertiary,
      solidFg: c.onTertiary,
      containerBg: c.tertiaryContainer,
      containerFg: c.onTertiaryContainer,
    },
    error: {
      solidBg: c.error,
      solidFg: c.onError,
      containerBg: c.errorContainer,
      containerFg: c.onErrorContainer,
    },
  }[tone];

  const variantDefaults = {
    filled: {
      backgroundColor: palette.solidBg,
      color: palette.solidFg,
      borderColor: "transparent",
    },
    tonal: {
      backgroundColor: palette.containerBg,
      color: palette.containerFg,
      borderColor: "transparent",
    },
    outlined: {
      backgroundColor: "transparent",
      color: palette.solidBg,
      borderColor: c.outline,
    },
    text: {
      backgroundColor: "transparent",
      color: palette.solidBg,
      borderColor: "transparent",
    },
  }[variant];

  const resolvedBg = backgroundColor ?? variantDefaults.backgroundColor;
  const resolvedFg = color ?? variantDefaults.color;
  const resolvedBorder = borderColor ?? variantDefaults.borderColor;

  const hasIcon = Boolean(icon);
  const paddingLeft =
    variant === "text"
      ? ct.padding.md
      : hasIcon && iconPosition === "left"
        ? ct.padding.md
        : ct.padding.lg;
  const paddingRight =
    variant === "text"
      ? ct.padding.md
      : hasIcon && iconPosition === "right"
        ? ct.padding.md
        : ct.padding.lg;

  // Supports both a ReactNode (<Feather ... />) or a render function (({ color, size }) => <Feather color={color} size={size} />)
  const iconElement =
    typeof icon === "function" ? icon({ color: resolvedFg, size: 18 }) : icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        {
          flex,
          width,
          minHeight: 40,
          paddingVertical: ct.padding.sm,
          paddingLeft,
          paddingRight,
          borderRadius: ct.radius.full,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: ct.space.sm,
          backgroundColor: resolvedBg,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: resolvedBorder,
          opacity: isDisabled ? 0.38 : 1, // M3 standard disabled opacity is 38%
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedFg} />
      ) : (
        <>
          {iconPosition === "left" && iconElement}

          <Text
            numberOfLines={1}
            style={[ct.text.buttonText, { color: resolvedFg }]}
          >
            {label}
          </Text>

          {iconPosition === "right" && iconElement}
        </>
      )}
    </TouchableOpacity>
  );
}
