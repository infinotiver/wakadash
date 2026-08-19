import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type IconName = keyof typeof Feather.glyphMap;

interface AppBarAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AppBarProps {
  title: string;
  variant?: "small" | "center";

  elevated?: boolean;
  leadingIcon?: IconName;
  leadingLabel?: string;
  onLeadingPress?: () => void;
  actions?: AppBarAction[];
}

const BAR_HEIGHT = 64;
const ICON_BUTTON_SIZE = 40;
const ICON_SIZE = 24;

export function AppBar({
  title,
  variant = "small",
  elevated = false,
  leadingIcon = "arrow-left",
  leadingLabel = "Go back",
  onLeadingPress,
  actions = [],
}: AppBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const containerColor = elevated ? colors.surfaceContainer : colors.surface;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: containerColor,
          paddingTop: Platform.OS === "web" ? ct.sm : insets.top,
        },
      ]}
    >
      <View style={styles.row}>
        {onLeadingPress ? (
          <Pressable
            accessibilityLabel={leadingLabel}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onLeadingPress}
            style={({ pressed }) => [
              styles.iconButton,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather
              name={leadingIcon}
              size={ICON_SIZE}
              color={colors.onSurface}
            />
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}

        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: colors.onSurface,
              fontFamily: ct.fontFamily.medium ?? ct.fontFamily.regular,
              textAlign: variant === "center" ? "center" : "left",
            },
          ]}
        >
          {title}
        </Text>

        <View style={styles.actions}>
          {actions.length > 0 ? (
            actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityLabel={action.label}
                accessibilityRole="button"
                disabled={action.disabled}
                hitSlop={8}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    opacity: action.disabled ? 0.4 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather
                  name={action.icon}
                  size={ICON_SIZE}
                  color={colors.onSurface}
                />
              </Pressable>
            ))
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { width: "100%" },
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    marginHorizontal: 4,
  },
  actions: { flexDirection: "row" },
});
