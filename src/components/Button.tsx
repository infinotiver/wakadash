import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ViewStyle,
  DimensionValue,
} from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type ButtonVariant = "filled" | "outlined" | "text" | "tonal";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  flex?: number;
  width?: DimensionValue;
  style?: ViewStyle;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function Button({
  label,
  onPress,
  variant = "filled",
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

  const defaults = {
    filled: {
      backgroundColor: c.secondary,
      color: c.onSecondary,
      borderColor: "transparent",
    },
    tonal: {
      backgroundColor: c.secondaryContainer,
      color: c.onSecondaryContainer,
      borderColor: "transparent",
    },
    outlined: {
      backgroundColor: "transparent",
      color: c.onSurface,
      borderColor: c.outline,
    },
    text: {
      backgroundColor: "transparent",
      color: c.secondary,
      borderColor: "transparent",
    },
  }[variant];

  const iconElement = icon && <>{icon}</>;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          flex,
          width,
          minHeight: 40,
          paddingHorizontal: ct.padding.lg,
          borderRadius: ct.radius.full,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: ct.space.xs,
          backgroundColor: backgroundColor ?? defaults.backgroundColor,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: borderColor ?? defaults.borderColor,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color ?? defaults.color} />
      ) : (
        <>
          {iconPosition === "left" && iconElement}

          <Text
            style={[ct.text.buttonText, { color: color ?? defaults.color }]}
          >
            {label}
          </Text>

          {iconPosition === "right" && iconElement}
        </>
      )}
    </TouchableOpacity>
  );
}
