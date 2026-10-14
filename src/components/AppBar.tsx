import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface AppBarAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AppBarProps {
  title: string;
  variant?: "small" | "center"; // small = left-aligned title
  elevated?: boolean; // true when content has scrolled under the bar
  leadingIcon?: IconName;
  leadingLabel?: string;
  onLeadingPress?: () => void;
  actions?: AppBarAction[];
}

// M3 top app bar (small / center-aligned)
const BAR_HEIGHT = 64;
const BUTTON_SIZE = 48; // minimum touch target
const ICON_SIZE = 24;
const EDGE_PADDING = ct.space.xs; // 4: bar edge to icon button
const TITLE_INSET = ct.space.lg; // 16: bar edge to title when there is no leading icon
const PRESSED_OPACITY = 0.1; // M3 pressed state layer
const DISABLED_OPACITY = 0.38; // M3 disabled content

// Round 48dp icon button with a state layer on press.
function IconButton({
  icon,
  label,
  onPress,
  disabled,
  color,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  color: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.iconButton, disabled && { opacity: DISABLED_OPACITY }]}
    >
      {({ pressed }) => (
        <>
          {pressed ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: BUTTON_SIZE / 2,
                  backgroundColor: colors.onSurfaceVariant,
                  opacity: PRESSED_OPACITY,
                },
              ]}
            />
          ) : null}
          <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={color} />
        </>
      )}
    </Pressable>
  );
}

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
  const isCenter = variant === "center";

  // Center variant: both sides get the same width so the title stays truly centered.
  const sideWidth = BUTTON_SIZE * Math.max(1, actions.length);

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: elevated ? colors.surfaceContainer : colors.surface,
        paddingTop: Platform.OS === "web" ? ct.space.sm : insets.top,
      }}
    >
      <View style={styles.row}>
        {/* Leading: back/menu button. M3 colors it on-surface. */}
        {onLeadingPress ? (
          <View style={isCenter ? { width: sideWidth } : undefined}>
            <IconButton
              icon={leadingIcon}
              label={leadingLabel}
              onPress={onLeadingPress}
              color={colors.onSurface}
            />
          </View>
        ) : isCenter ? (
          <View style={{ width: sideWidth }} />
        ) : null}

        {/* Title: Title Large (22/28, regular). Starts right after the icon button,
            or 16 from the edge when there is no leading icon. */}
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: colors.onSurface,
              fontFamily: ct.fontFamily.regular,
              textAlign: isCenter ? "center" : "left",
              marginLeft:
                !isCenter && !onLeadingPress ? TITLE_INSET - EDGE_PADDING : 0,
            },
          ]}
        >
          {title}
        </Text>

        {/* Trailing actions. M3 colors them on-surface-variant. */}
        {actions.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              width: isCenter ? sideWidth : undefined,
            }}
          >
            {actions.map((action) => (
              <IconButton
                key={action.label}
                icon={action.icon}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                color={colors.onSurfaceVariant}
              />
            ))}
          </View>
        ) : isCenter ? (
          <View style={{ width: sideWidth }} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: EDGE_PADDING,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 22, // Title Large
    lineHeight: 28,
  },
});
